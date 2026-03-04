import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SalaryStructure } from '../domain/salary-structure.entity';
import { PayrollRecord } from '../domain/payroll-record.entity';
import { Transaction, TransactionStatus, TransactionType } from '../domain/transaction.entity';
import { Ledger } from '../domain/ledger.entity';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

@Injectable()
export class PayrollService {
    private salaryStructureRepo: Repository<SalaryStructure>;
    private payrollRecordRepo: Repository<PayrollRecord>;

    constructor(
        private dataSource: DataSource,
        private recordActionUseCase: RecordActionUseCase
    ) {
        this.salaryStructureRepo = this.dataSource.getRepository(SalaryStructure);
        this.payrollRecordRepo = this.dataSource.getRepository(PayrollRecord);
    }

    async createSalaryStructure(schoolId: string, data: any): Promise<SalaryStructure> {
        const structure = this.salaryStructureRepo.create({ ...data, schoolId }) as unknown as SalaryStructure;
        return this.salaryStructureRepo.save(structure);
    }

    async processMonthlyPayroll(schoolId: string, month: string, userId: string): Promise<number> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const structures = await queryRunner.manager.find(SalaryStructure, {
                where: { schoolId, isActive: true }
            });

            let processedCount = 0;

            for (const struct of structures) {
                // Check if already processed
                const existing = await queryRunner.manager.findOne(PayrollRecord, {
                    where: { schoolId, staffId: struct.staffId, month }
                });

                if (existing) continue;

                const netAmount = Number(struct.baseSalary) + Number(struct.allowances) - Number(struct.deductions);

                // 1. Create Transaction
                const transaction = queryRunner.manager.create(Transaction, {
                    schoolId,
                    studentId: struct.staffId, // Using studentId field as generic recipient for simplified v3 schema
                    amount: netAmount,
                    currency: 'USD',
                    status: TransactionStatus.COMPLETED,
                    type: TransactionType.PAYROLL,
                    paymentMethod: 'TRANSFER',
                    createdBy: userId,
                    metadata: { month, staffId: struct.staffId }
                });
                const savedTx = await queryRunner.manager.save(transaction);

                // 2. Create Payroll Record
                const record = queryRunner.manager.create(PayrollRecord, {
                    schoolId,
                    staffId: struct.staffId,
                    salaryStructureId: struct.id,
                    month,
                    netAmount,
                    status: 'PAID',
                    processedAt: new Date()
                }) as unknown as PayrollRecord;
                await queryRunner.manager.save(record);

                // 3. Create Ledger Entry (DEBIT for salary expense)
                const ledger = queryRunner.manager.create(Ledger, {
                    schoolId,
                    transactionId: savedTx.id,
                    amount: netAmount,
                    type: 'DEBIT',
                    category: 'PAYROLL',
                    description: `Salary disbursement for ${month} - Staff: ${struct.staffId}`
                });
                await queryRunner.manager.save(ledger);

                processedCount++;
            }

            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.CREATE,
                resource: 'PAYROLL_BATCH',
                resourceId: month,
                payload: { processedCount }
            }, userId, '127.0.0.1', 'ADMIN-CONSOLE');

            await queryRunner.commitTransaction();
            return processedCount;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getStaffPayrollHistory(schoolId: string, staffId: string): Promise<PayrollRecord[]> {
        return this.payrollRecordRepo.find({
            where: { schoolId, staffId },
            order: { month: 'DESC' }
        });
    }
}
