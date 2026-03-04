import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Exam } from './domain/exam.entity';
import { ExamAttempt } from './domain/exam-attempt.entity';
import { ExamResponse } from './domain/exam-response.entity';
import { ExamRepository, ExamAttemptRepository } from './infrastructure/exam.repository';
import { StartExamUseCase } from './use-cases/start-exam.use-case';
import { AutoSubmitExamUseCase } from './use-cases/auto-submit-exam.use-case';
import { ExamController } from './presentation/exam.controller';
import { SubmitAnswerUseCase } from './use-cases/submit-answer.use-case';
import { FinalizeExamUseCase } from './use-cases/finalize-exam.use-case';
import { ViolationListener } from './infrastructure/violation.listener';
import { AuditModule } from '@app/audit-service/audit.module';
import { SecurityModule } from '@libs/security/security.module';
import { ScoringService } from './domain/scoring.service';

import { User } from '@app/auth-service/domain/user.entity';
import { ListExamResultsUseCase } from './use-cases/list-exam-results.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, ExamAttempt, ExamResponse, User]),
    EventEmitterModule.forRoot(),
    AuditModule,
    SecurityModule,
  ],
  controllers: [ExamController],
  providers: [
    ExamRepository,
    ExamAttemptRepository,
    StartExamUseCase,
    SubmitAnswerUseCase,
    FinalizeExamUseCase,
    AutoSubmitExamUseCase,
    ListExamResultsUseCase,
    ViolationListener,
    ScoringService,
  ],
  exports: [ExamRepository, ExamAttemptRepository],
})
export class ExamModule { }
