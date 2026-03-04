import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProctoringEvent } from './domain/proctoring-event.entity';
import { ProctoringRepository } from './infrastructure/proctoring.repository';
import { ReportViolationUseCase } from './use-cases/report-violation.use-case';
import { ProctoringController } from './presentation/proctoring.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ProctoringEvent])],
    controllers: [ProctoringController],
    providers: [
        ProctoringRepository,
        ReportViolationUseCase,
    ],
    exports: [ReportViolationUseCase],
})
export class ProctoringModule { }
