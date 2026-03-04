import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FeeStructure } from '../domain/fee-structure.entity';
import { FeeAllocation } from '../domain/fee-allocation.entity';
import { Transaction, TransactionStatus, TransactionType } from '../domain/transaction.entity';
import { Ledger } from '../domain/ledger.entity';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

@Injectable()
export class FeeManagementService {
    private feeStructureRepo: Repository<FeeStructure>;
    private feeAllocationRepo: Repository<FeeAllocation>;

    constructor(
        private dataSource: DataSource,
        private recordActionUseCase: RecordActionUseCase
    ) {
        this.feeStructureRepo = this.dataSource.getRepository(FeeStructure);
        this.feeAllocationRepo = this.dataSource.getRepository(FeeAllocation);
    }

    async createFeeStructure(schoolId: string, data: any): Promise<FeeStructure> {
        const structure = this.feeStructureRepo.create({ ...data, schoolId }) as unknown as FeeStructure;
        return this.feeStructureRepo.save(structure);
    }

    async allocateFee(schoolId: string, studentId: string, feeStructureId: string, dueDate: string): Promise<FeeAllocation> {
        const structure = await this.feeStructureRepo.findOne({ where: { id: feeStructureId, schoolId } });
        if (!structure) throw new NotFoundException('Fee structure not found');

        const allocation = this.feeAllocationRepo.create({
            schoolId,
            studentId,
            feeStructureId,
            dueDate,
            paidAmount: 0,
            isFullyPaid: false
        }) as unknown as FeeAllocation;

        return this.feeAllocationRepo.save(allocation);
    }

    async processFeePayment(schoolId: string, allocationId: string, amount: number, paymentMethod: string, userId: string): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const allocation = await queryRunner.manager.findOne(FeeAllocation, {
                where: { id: allocationId, schoolId },
                relations: ['feeStructure']
            });

            if (!allocation) throw new NotFoundException('Fee allocation not found');
            if (allocation.isFullyPaid) throw new BadRequestException('Fee already fully paid');

            // 1. Create Transaction
            const transaction = queryRunner.manager.create(Transaction, {
                schoolId,
                studentId: allocation.studentId,
                amount,
                currency: 'USD', // Default
                status: TransactionStatus.COMPLETED,
                type: TransactionType.FEE_PAYMENT,
                paymentMethod,
                createdBy: userId,
                metadata: { allocationId }
            });

            const savedTx = await queryRunner.manager.save(transaction);

            // 2. Update Allocation
            allocation.paidAmount = Number(allocation.paidAmount) + amount;
            if (allocation.paidAmount >= allocation.feeStructure.amount) {
                allocation.isFullyPaid = true;
            }
            await queryRunner.manager.save(allocation);

            // 3. Create Ledger Entry
            const ledger = queryRunner.manager.create(Ledger, {
                schoolId,
                transactionId: savedTx.id,
                amount,
                type: 'CREDIT',
                category: 'FEE_COLLECTION',
                description: `Fee payment for ${allocation.feeStructure.name}`
            });
            await queryRunner.manager.save(ledger);

            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.CREATE,
                resource: 'FEE_PAYMENT',
                resourceId: savedTx.id,
                payload: { allocationId, amount }
            }, userId, '127.0.0.1', 'ADMIN-CONSOLE');

            await queryRunner.commitTransaction();
            return savedTx;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getStudentFees(schoolId: string, studentId: string): Promise<FeeAllocation[]> {
        return this.feeAllocationRepo.find({
            where: { schoolId, studentId },
            relations: ['feeStructure'],
            order: { dueDate: 'ASC' }
        });
    }

    async getTransactions(schoolId: string): Promise<Transaction[]> {
        return this.dataSource.getRepository(Transaction).find({
            where: { schoolId },
            order: { createdAt: 'DESC' },
            take: 50
        });
    }

    async calculateMonthlyRevenue(schoolId: string): Promise<number> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await this.dataSource.getRepository(Ledger).createQueryBuilder('ledger')
            .where('ledger.school_id = :schoolId', { schoolId })
            .andWhere('ledger.created_at >= :startOfMonth', { startOfMonth })
            .select('SUM(ledger.amount)', 'total')
            .getRawOne();

        return parseFloat(result.total) || 0;
    }
}
