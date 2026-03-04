import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AutoSubmitExamUseCase } from '../use-cases/auto-submit-exam.use-case';
import { ViolationSeverity } from '@app/violation-tracker/domain/violation-record.entity';

@Injectable()
export class ViolationListener {
    private readonly logger = new Logger(ViolationListener.name);

    constructor(private readonly autoSubmitUseCase: AutoSubmitExamUseCase) { }

    @OnEvent('violation.created')
    async handleViolationCreated(payload: { attemptId: string; severity: ViolationSeverity; type: string }) {
        // AUDIT FIX: Auto-submit threshold (Critical violations trigger immediate termination)
        if (payload.severity === ViolationSeverity.CRITICAL || payload.severity === ViolationSeverity.HIGH) {
            this.logger.warn(`Critical violation detected for attempt ${payload.attemptId}. Triggering auto-submit.`);

            await this.autoSubmitUseCase.execute(
                payload.attemptId,
                `Automated termination due to ${payload.severity} severity violation: ${payload.type}`
            );
        }
    }
}
