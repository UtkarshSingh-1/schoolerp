import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './domain/student.entity';
import { StudentRepository } from './infrastructure/student.repository';
import { CreateStudentUseCase } from './use-cases/create-student.use-case';
import { StudentController } from './presentation/student.controller';
import { HealthController } from './presentation/health.controller';
import { CreateManualStudentUseCase } from './use-cases/create-manual-student.use-case';
import { ListStudentsUseCase } from './use-cases/list-students.use-case';
import { AuditModule } from '@app/audit-service/audit.module';
import { SecurityModule } from '@libs/security/security.module';
import { User } from '@app/auth-service/domain/user.entity';
import { Attendance } from './domain/attendance.entity';
import { AttendanceController } from './presentation/attendance.controller';
import { AttendanceService } from './use-cases/attendance.service';
import { SyncBiometricLogsUseCase } from './use-cases/sync-biometric-logs.use-case';
import { LectureSchedule } from './domain/lecture-schedule.entity';
import { LectureScheduleController } from './presentation/lecture-schedule.controller';
import { LectureScheduleService } from './presentation/lecture-schedule.controller';
import { Class } from './domain/class.entity';
import { ClassController } from './presentation/class.controller';
import { ClassService } from './use-cases/class.service';
import { Subject } from './domain/subject.entity';
import { SubjectController } from './presentation/subject.controller';
import { SubjectService } from './use-cases/subject.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Student, User, Attendance, LectureSchedule, Class, Subject]),
        AuditModule,
        SecurityModule,
    ],
    controllers: [
        StudentController,
        HealthController,
        AttendanceController,
        LectureScheduleController,
        ClassController,
        SubjectController
    ],
    providers: [
        StudentRepository,
        CreateStudentUseCase,
        CreateManualStudentUseCase,
        AttendanceService,
        SyncBiometricLogsUseCase,
        LectureScheduleService,
        ClassService,
        SubjectService,
        ListStudentsUseCase,
    ],
    exports: [
        CreateStudentUseCase,
        StudentRepository,
        AttendanceService,
        ListStudentsUseCase
    ],
})
export class StudentModule { }
