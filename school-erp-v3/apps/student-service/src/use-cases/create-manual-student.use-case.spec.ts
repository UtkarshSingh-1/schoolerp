import { Test, TestingModule } from '@nestjs/testing';
import { CreateManualStudentUseCase } from './create-manual-student.use-case';
import { DataSource } from 'typeorm';
import { RecordActionUseCase } from '../../../audit-service/src/use-cases/record-action.use-case';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';
import { User } from '../../../auth-service/src/domain/user.entity';

describe('CreateManualStudentUseCase (Hardening)', () => {
    let useCase: CreateManualStudentUseCase;
    let queryRunner: any;

    beforeEach(async () => {
        queryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                findOne: jest.fn(),
                create: jest.fn(),
                save: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateManualStudentUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        createQueryRunner: () => queryRunner,
                    },
                },
                {
                    provide: RecordActionUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: EventEmitter2,
                    useValue: { emit: jest.fn() },
                },
            ],
        }).compile();

        useCase = module.get<CreateManualStudentUseCase>(CreateManualStudentUseCase);
    });

    it('PROD-HARDENING: should release connection even if transaction fails', async () => {
        queryRunner.manager.findOne.mockRejectedValue(new Error('DB_FAIL'));

        await expect(useCase.execute('school-1', 'admin-1', {
            email: 'test@school.com',
            firstName: 'John',
            lastName: 'Doe',
            classId: 'class-1',
            parentContact: '1234567890',
            gender: 'M',
            autoAssignFee: false
        })).rejects.toThrow('DB_FAIL');

        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled(); // PROOF: Connection safety
    });

    it('PROD-HARDENING: should reject if email already exists in the same tenant', async () => {
        queryRunner.manager.findOne.mockResolvedValue({ id: 'existing-user' });

        await expect(useCase.execute('school-1', 'admin-1', {
            email: 'existing@school.com',
            firstName: 'John',
            lastName: 'Doe',
            classId: 'class-1',
            parentContact: '1234567890',
            gender: 'M',
            autoAssignFee: false
        })).rejects.toThrow(ConflictException);

        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
    });
});
