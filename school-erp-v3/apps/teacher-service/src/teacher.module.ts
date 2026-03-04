import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './domain/teacher.entity';
import { AuditModule } from '@app/audit-service/audit.module';
import { TeacherRepository } from './infrastructure/teacher.repository';
import { CreateTeacherUseCase } from './use-cases/create-teacher.use-case';
import { ListTeachersUseCase } from './use-cases/list-teachers.use-case';
import { TeacherController } from './presentation/teacher.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Teacher]),
        AuditModule,
    ],
    controllers: [TeacherController],
    providers: [
        TeacherRepository,
        CreateTeacherUseCase,
        ListTeachersUseCase,
    ],
    exports: [CreateTeacherUseCase, ListTeachersUseCase],
})
export class TeacherModule { }
