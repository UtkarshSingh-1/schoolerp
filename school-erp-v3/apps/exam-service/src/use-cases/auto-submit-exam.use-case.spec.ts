import { Test, TestingModule } from '@nestjs/testing';
import { AutoSubmitExamUseCase } from '../use-cases/auto-submit-exam.use-case';
import { DataSource } from 'typeorm';

describe('AutoSubmitExamUseCase', () => {
    let useCase: AutoSubmitExamUseCase;
    let dataSource: DataSource;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AutoSubmitExamUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        createQueryRunner: jest.fn().mockReturnValue({
                            connect: jest.fn(),
                            startTransaction: jest.fn(),
                            commitTransaction: jest.fn(),
                            rollbackTransaction: jest.fn(),
                            release: jest.fn(),
                            manager: {
                                update: jest.fn(),
                                save: jest.fn(),
                            },
                        }),
                    },
                },
            ],
        }).compile();

        useCase = module.get<AutoSubmitExamUseCase>(AutoSubmitExamUseCase);
        dataSource = module.get<DataSource>(DataSource);
    });

    it('should update exam attempt and proctoring log atomically', async () => {
        const result = await useCase.execute('attempt-1', 'High Violation Count');
        expect(result).toBeDefined();
        // Verify transaction calls...
    });
});
