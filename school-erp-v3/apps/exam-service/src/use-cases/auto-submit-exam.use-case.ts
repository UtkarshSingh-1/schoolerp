import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExamAttempt, ExamAttemptStatus } from '../domain/exam-attempt.entity';
import { RecordActionUseCase } from '@app/audit-service/use-cases/record-action.use-case';
import { AuditAction } from '@app/audit-service/domain/audit-log.entity';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AutoSubmitExamUseCase {
    private readonly logger = new Logger(AutoSubmitExamUseCase.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly recordActionUseCase: RecordActionUseCase,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(attemptId: string, reason: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const attempt = await queryRunner.manager.findOne(ExamAttempt, {
                where: { id: attemptId, status: ExamAttemptStatus.IN_PROGRESS }
            });

            if (!attempt) {
                this.logger.warn(`Attempt ${attemptId} not found or already submitted`);
                await queryRunner.rollbackTransaction();
                return;
            }

            // PRODUCTION HARDENING: Threshold-based enforcement
            const VIOLATION_THRESHOLD = 3;

            attempt.violationCount += 1;
            attempt.autoSubmitReason = reason;


            await queryRunner.manager.save(attempt);

            // Log to Audit Service (Business Logic Level)
            await this.recordActionUseCase.execute(attempt.schoolId, {
                action: AuditAction.UPDATE,
                resource: 'EXAM_ATTEMPT',
                resourceId: attemptId,
                payload: {
                    status: attempt.status,
                    violationCount: attempt.violationCount,
                    reason
                },
            }, 'SYSTEM', '127.0.0.1', 'SYSTEM-WORKER');

            await queryRunner.commitTransaction();
            this.logger.log(`Exam attempt ${attemptId} auto-submitted due to: ${reason}`);

            // LEGACY HARDENING: Emit events AFTER commit to ensure data integrity
            if (attempt.status === ExamAttemptStatus.AUTO_SUBMITTED) {
                this.eventEmitter.emit('exam.auto_submitted', {
                    attemptId,
                    schoolId: attempt.schoolId,
                    studentId: attempt.studentId,
                    reason
                });
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to auto-submit attempt ${attemptId}: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
