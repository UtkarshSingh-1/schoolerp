import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../infrastructure/student.repository';
import { CreateStudentDto } from '../presentation/dto/create-student.dto';
import { Student } from '../domain/student.entity';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

@Injectable()
export class CreateStudentUseCase {
    constructor(
        private readonly studentRepository: StudentRepository,
        private readonly recordActionUseCase: RecordActionUseCase
    ) { }

    async execute(schoolId: string, dto: CreateStudentDto, userId: string): Promise<Student> {
        const [firstName, ...lastNameParts] = dto.fullName.split(' ');
        const lastName = lastNameParts.join(' ') || 'N/A';

        const student = await this.studentRepository.createStudent(schoolId, {
            ...dto,
            firstName,
            lastName,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            admissionNumber: `ADM-${Date.now()}`, // Simple generation logic
            createdBy: userId,
        } as any);

        // Audit logging is non-fatal — don't let a missing audit_logs table
        // crash student creation
        try {
            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.CREATE,
                resource: 'STUDENT',
                resourceId: student.id,
                payload: dto,
            }, userId, '127.0.0.1', 'WEB-UI');
        } catch (auditError) {
            console.warn('[AUDIT] Failed to record audit log for student creation:', auditError.message);
        }

        return student;
    }
}
