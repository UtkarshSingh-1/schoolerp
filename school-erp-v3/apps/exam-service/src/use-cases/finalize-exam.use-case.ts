import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExamAttempt, ExamAttemptStatus } from '../domain/exam-attempt.entity';
import { ExamResponse } from '../domain/exam-response.entity';
import { ScoringService } from '../domain/scoring.service';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

@Injectable()
export class FinalizeExamUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly scoringService: ScoringService,
        private readonly recordActionUseCase: RecordActionUseCase
    ) { }

    async execute(schoolId: string, attemptId: string): Promise<ExamAttempt> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const attempt = await queryRunner.manager.findOne(ExamAttempt, {
                where: { id: attemptId, schoolId, status: ExamAttemptStatus.IN_PROGRESS }
            });

            if (!attempt) {
                throw new NotFoundException('Active exam attempt not found');
            }

            // Fetch responses to calculate score
            const responses = await queryRunner.manager.find(ExamResponse, {
                where: { attemptId }
            });

            // PRODUCTION HARDENING: Automated scoring via ScoringService
            const totalQuestions = responses.length || 1;
            const correctCount = responses.filter(r => r.isCorrect === true).length;

            const result = this.scoringService.calculateResult(totalQuestions, correctCount);

            attempt.score = result.score;
            attempt.grade = result.grade;
            attempt.totalQuestions = totalQuestions;
            attempt.correctAnswers = correctCount;
            attempt.status = ExamAttemptStatus.SUBMITTED;
            attempt.submittedAt = new Date();

            const savedAttempt = await queryRunner.manager.save(attempt);

            await this.recordActionUseCase.execute(schoolId, {
                action: AuditAction.UPDATE,
                resource: 'EXAM_ATTEMPT',
                resourceId: attemptId,
                payload: {
                    score: attempt.score,
                    grade: attempt.grade,
                    status: attempt.status
                }
            }, 'SYSTEM', '127.0.0.1', 'SYSTEM-WORKER');

            await queryRunner.commitTransaction();
            return savedAttempt;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
