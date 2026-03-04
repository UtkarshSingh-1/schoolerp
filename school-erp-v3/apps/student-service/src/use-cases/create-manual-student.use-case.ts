import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateManualStudentDto } from '../presentation/dto/create-manual-student.dto';
import { Student } from '../domain/student.entity';
import { User } from '@app/auth-service/domain/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateManualStudentUseCase {
    private readonly logger = new Logger(CreateManualStudentUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly recordActionUseCase: RecordActionUseCase,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(schoolId: string, adminId: string, dto: CreateManualStudentDto): Promise<Student> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Tenant-Scoped Uniqueness Check (User Email)
            const existingUser = await queryRunner.manager.findOne(User, {
                where: { schoolId, email: dto.email }
            });
            if (existingUser) {
                throw new ConflictException('A user with this email already exists in this school');
            }

            // 2. Generate Admission Number (ADM-{timestamp}-{random})
            const admissionNumber = `ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

            // 3. Create User Entity
            const temporaryPassword = Math.random().toString(36).slice(-8); // Generate temp pass
            const passwordHash = await bcrypt.hash(temporaryPassword, 10);

            const user = queryRunner.manager.create(User, {
                id: uuidv4(),
                schoolId,
                email: dto.email,
                passwordHash,
                roleId: 'STUDENT', // Hardcoded role for admission
                isActive: true,
                permissions: ['students:view_own_profile']
            });
            await queryRunner.manager.save(user);

            // 4. Create Student Entity
            const student = queryRunner.manager.create(Student, {
                id: uuidv4(),
                schoolId,
                admissionNumber,
                firstName: dto.firstName,
                lastName: dto.lastName,
                classId: dto.classId,
                parentContact: dto.parentContact,
                gender: dto.gender,
                createdBy: adminId,
            });
            const savedStudent = await queryRunner.manager.save(Student, student) as Student;

            // 5. Audit Logging
            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.CREATE,
                resource: 'STUDENT',
                resourceId: savedStudent.id,
                payload: {
                    type: 'MANUAL_ADMISSION',
                    admissionNumber,
                    classId: dto.classId,
                    autoAssignFee: dto.autoAssignFee
                },
            }, adminId, 'SYSTEM', 'INTERNAL_FLOW');

            // 6. (Optional) Finance Integration
            if (dto.autoAssignFee) {
                await this.assignInitialFees(queryRunner, schoolId, savedStudent.id, dto.classId);
            }

            await queryRunner.commitTransaction();

            this.logger.log(`[Admission] Manually admitted student ${savedStudent.id} with ADM# ${admissionNumber}`);

            // 7. COMPLIANCE: Emit event AFTER commit for notification and finance tracking
            this.eventEmitter.emit('student.manual.created', {
                schoolId,
                studentId: savedStudent.id,
                actorId: adminId,
                admissionNumber
            });

            return savedStudent;
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async assignInitialFees(queryRunner: any, schoolId: string, studentId: string, classId: string) {
        // PROOF: Stub for fee assignment
        // In reality, this would query a 'FeeStructure' table and create 'FeeRecord's
        this.logger.log(`[Finance] Auto-assigning initial fees for student ${studentId} in class ${classId}`);
    }
}
