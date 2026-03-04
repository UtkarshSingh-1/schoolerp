import { Injectable } from '@nestjs/common';
import { TeacherRepository } from '../infrastructure/teacher.repository';
import { CreateTeacherDto } from '../presentation/dto/create-teacher.dto';
import { Teacher } from '../domain/teacher.entity';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateTeacherUseCase {
    constructor(
        private readonly teacherRepository: TeacherRepository,
        private readonly recordActionUseCase: RecordActionUseCase,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(schoolId: string, userId: string, dto: CreateTeacherDto): Promise<Teacher> {
        const teacher = await this.teacherRepository.createTeacher(schoolId, {
            ...dto,
            userId,
            createdBy: userId,
        });

        await this.recordActionUseCase.execute(schoolId, {
            action: AuditAction.CREATE,
            resource: 'TEACHER',
            resourceId: teacher.id,
            payload: dto,
        }, userId, '127.0.0.1', 'WEB-UI');

        this.eventEmitter.emit('teacher.created', {
            schoolId,
            teacherId: teacher.id,
            userId,
        });

        return teacher;
    }
}
