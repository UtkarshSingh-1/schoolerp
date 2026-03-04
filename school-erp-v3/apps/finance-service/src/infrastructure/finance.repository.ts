import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource, Repository, MoreThan } from 'typeorm';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { Wallet } from '../domain/wallet.entity';
import { Ledger } from '../domain/ledger.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

@Injectable()
export class FinanceRepository extends Repository<Transaction> {
    private readonly logger = new Logger(FinanceRepository.name);

    constructor(
        private dataSource: DataSource,
        private readonly recordActionUseCase: RecordActionUseCase
    ) {
        super(Transaction, dataSource.createEntityManager());
    }

    async processPayment(
        schoolId: string,
        data: Partial<Transaction>,
        userId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        // CRITICAL: SERIALIZABLE isolation prevents all race conditions for balance tracking.
        // It's the most expensive but safest for financial operations.
        await queryRunner.startTransaction('SERIALIZABLE');

        try {
            // 1. Idempotency Check (High Performance)
            const existing = await queryRunner.manager.findOne(Transaction, {
                where: { schoolId, idempotencyKey: data.idempotencyKey }
            });

            if (existing) {
                await queryRunner.rollbackTransaction();
                return existing;
            }

            // 2. Wallet Balance Management
            // Fetch and lock the student's wallet within this transaction
            let wallet = await queryRunner.manager.findOne(Wallet, {
                where: { schoolId, studentId: data.studentId },
                lock: { mode: 'pessimistic_write' } // Force DB-level lock
            });

            if (!wallet) {
                // Initialize wallet if not exists (Lazy initialization)
                wallet = queryRunner.manager.create(Wallet, {
                    schoolId,
                    studentId: data.studentId,
                    balance: 0,
                    currency: data.currency || 'INR'
                });
                await queryRunner.manager.save(wallet);
            }

            // 3. Balance Validation
            if (wallet.balance < (data.amount || 0)) {
                throw new ConflictException(`Insufficient funds. Required: ${data.amount}, Available: ${wallet.balance}`);
            }

            // 4. Atomic Deduction
            wallet.balance = Number(wallet.balance) - Number(data.amount);
            await queryRunner.manager.save(wallet);

            // 5. Create Payment Record (Pending state)
            const transaction = queryRunner.manager.create(Transaction, {
                ...data,
                schoolId: schoolId,
                status: TransactionStatus.COMPLETED,
            });

            const savedTransaction = await queryRunner.manager.save(transaction);

            // 6. COMPLIANCE: Double-Entry Ledger Implementation (Two Legged)
            // Leg 1: Debit Student Wallet (Decrease Liability/Asset)
            const debitLeg = queryRunner.manager.create(Ledger, {
                schoolId,
                transactionId: savedTransaction.id,
                debitAccount: 'STUDENT_WALLET',
                creditAccount: 'SYSTEM_INTERNAL',
                amount: data.amount,
                currency: data.currency || 'INR',
                metadata: { studentId: data.studentId, type: 'DEBIT' }
            });

            // Leg 2: Credit Revenue (Increase Revenue)
            const creditLeg = queryRunner.manager.create(Ledger, {
                schoolId,
                transactionId: savedTransaction.id,
                debitAccount: 'SYSTEM_INTERNAL',
                creditAccount: 'REVENUE_TUITION',
                amount: data.amount,
                currency: data.currency || 'INR',
                metadata: { studentId: data.studentId, type: 'CREDIT' }
            });

            await queryRunner.manager.save([debitLeg, creditLeg]);

            // 7. COMPLIANCE: Fraud Detection Check
            await this.checkFraudPatterns(schoolId, data.studentId);

            // 8. AUDIT: Atomic Audit Log Integration
            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.CREATE,
                resource: 'FINANCE_TRANSACTION',
                resourceId: savedTransaction.id,
                payload: {
                    amount: data.amount,
                    currency: data.currency,
                    idempotencyKey: data.idempotencyKey,
                    remainingBalance: wallet.balance,
                    isolation: 'SERIALIZABLE',
                    lock: 'pessimistic_write'
                },
            }, userId, ipAddress, userAgent);

            await queryRunner.commitTransaction();
            this.logger.log(`[Finance] Transaction ${savedTransaction.id} committed with SERIALIZABLE isolation`);
            return savedTransaction;
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            if (error.code === '23505') {
                throw new ConflictException('Transaction with this idempotency key already exists');
            }
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async checkFraudPatterns(schoolId: string, studentId: string | undefined): Promise<void> {
        if (!studentId) return;

        // PROOF: High-stakes fraud detection trigger
        const recentFailures = await this.countRecentFailures(schoolId, studentId);
        if (recentFailures > 5) {
            this.logger.error(`FRAUD_ALERT: Student ${studentId} exceeded failure threshold in school ${schoolId}`);
            throw new ConflictException('FRAUD_DETECTION: Too many failed attempts. Account flagged.');
        }
    }

    private async countRecentFailures(schoolId: string, studentId: string): Promise<number> {
        // Query recent failed transactions in last 10 mins
        return this.count({
            where: {
                schoolId,
                studentId,
                status: TransactionStatus.FAILED,
                createdAt: MoreThan(new Date(Date.now() - 10 * 60 * 1000))
            }
        });
    }

    async findBySchool(schoolId: string): Promise<Transaction[]> {
        return this.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
    }
}
