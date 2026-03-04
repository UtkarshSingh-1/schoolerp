import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FinanceRepository } from '../finance.repository';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';
import { Wallet } from '../../domain/wallet.entity';
import { RecordActionUseCase } from '../../../../audit-service/src/use-cases/record-action.use-case';

describe('FinanceRepository (Integration)', () => {
    let repository: FinanceRepository;
    let dataSource: DataSource;
    let walletRepo: Repository<Wallet>;

    const mockRecordActionUseCase = {
        execute: jest.fn().mockResolvedValue({}),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:', // Use in-memory SQLite for speed
                    entities: [Transaction, Wallet],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([Transaction, Wallet]),
            ],
            providers: [
                FinanceRepository,
                { provide: RecordActionUseCase, useValue: mockRecordActionUseCase },
            ],
        }).compile();

        repository = module.get<FinanceRepository>(FinanceRepository);
        dataSource = module.get<DataSource>(DataSource);
        walletRepo = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        // Clean database before each test
        await dataSource.query('DELETE FROM transactions');
        await dataSource.query('DELETE FROM wallets');
        jest.clearAllMocks();
    });

    it('should prevent double-spending with concurrent payments', async () => {
        const schoolId = 'school-1';
        const studentId = 'student-1';
        const amount = 60;

        // Setup: One wallet with 100 INR
        await walletRepo.save({
            schoolId,
            studentId,
            balance: 100,
            currency: 'INR',
        });

        // Act: Fire two concurrent payments of 60 INR each (Total 120 > 100)
        // Note: SQLite ':memory:' doesn't support complex SERIALIZABLE isolation in the same way 
        // as Postgres, but it serves as a logic check for our transactional code.
        const payment1 = repository.processPayment(
            schoolId,
            { amount, studentId, idempotencyKey: 'key-1' },
            'user-1', '127.0.0.1', 'test-ua'
        );
        const payment2 = repository.processPayment(
            schoolId,
            { amount, studentId, idempotencyKey: 'key-2' },
            'user-1', '127.0.0.1', 'test-ua'
        );

        const results = await Promise.allSettled([payment1, payment2]);

        // Assert: One should succeed, one should fail (Insufficient Funds)
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected = results.filter(r => r.status === 'rejected');

        expect(fulfilled.length).toBe(1);
        expect(rejected.length).toBe(1);

        const walletAfter = await walletRepo.findOne({ where: { schoolId, studentId } });
        expect(Number(walletAfter?.balance)).toBe(40); // 100 - 60
    });

    it('should enforce idempotency even in concurrent calls', async () => {
        const schoolId = 'school-1';
        const studentId = 'student-2';
        const idempotencyKey = 'same-key';

        await walletRepo.save({
            schoolId,
            studentId,
            balance: 1000,
        });

        // Act: Fire two identical payments concurrently
        const p1 = repository.processPayment(
            schoolId,
            { amount: 100, studentId, idempotencyKey },
            'user-1', '127.0.0.1', 'test-ua'
        );
        const p2 = repository.processPayment(
            schoolId,
            { amount: 100, studentId, idempotencyKey },
            'user-1', '127.0.0.1', 'test-ua'
        );

        const results = await Promise.allSettled([p1, p2]);

        // Assert: Only one deduction should occur
        const walletAfter = await walletRepo.findOne({ where: { schoolId, studentId } });
        expect(Number(walletAfter?.balance)).toBe(900);
    });
});
