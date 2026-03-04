import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { runWithSchoolId } from './tenant.context';

export abstract class BaseTenantProcessor extends WorkerHost {
    async process(job: Job<any>, token?: string): Promise<any> {
        const { schoolId } = job.data;
        if (!schoolId) {
            throw new Error(`Job ${job.id} missing schoolId context`);
        }

        return runWithSchoolId(schoolId, async () => {
            try {
                const result = await this.handleJob(job, token);
                console.log(`[Worker] Job ${job.id} (${job.name}) completed successfully`);
                return result;
            } catch (error: any) {
                console.error(`[Worker] Job ${job.id} (${job.name}) failed: ${error.message}`);

                const dlqQueueName = this.getDlqQueueName();
                // PROOF: Explicit DLQ movement on exhaustion
                if (dlqQueueName && job.attemptsMade >= (job.opts.attempts || 1)) {
                    console.error(`[DLQ] Job ${job.id} exhausted all retries. Moving to ${dlqQueueName}.`);

                    const dlqPayload = {
                        ...job.data,
                        failedAt: new Date(),
                        error: error.message,
                        stack: error.stack,
                        originalJobId: job.id,
                    };

                    this.handleDlqMovement(dlqQueueName, dlqPayload);
                }
                throw error; // Still throw to let BullMQ handle internal retry count
            }
        });
    }

    abstract handleJob(job: Job<any>, token?: string): Promise<any>;

    /**
     * Optional: Return a dedicated DLQ queue name for this processor.
     * If provided, jobs will be explicitly moved here on exhaustion.
     */
    protected abstract getDlqQueueName(): string | null;

    protected handleDlqMovement(queueName: string, payload: any) {
        // Implementation stub for moving to DLQ
        console.log(`[DLQ] EXPLICIT MOVE: ${queueName}`, payload);
    }
}
