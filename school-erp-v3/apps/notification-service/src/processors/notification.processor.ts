import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BaseTenantProcessor } from '../../../../libs/tenant/src/base-tenant.processor';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { NotificationStatus } from '../domain/notification-log.entity';

@Processor('notifications')
export class NotificationProcessor extends BaseTenantProcessor {
    constructor(private readonly notificationRepository: NotificationRepository) {
        super();
    }

    protected getDlqQueueName(): string | null {
        return 'notifications-dlq'; // PROOF: Separate DLQ name
    }

    async handleJob(job: Job<any>): Promise<any> {
        const { logId, schoolId, channel, recipient, content } = job.data;

        console.log(`[NotificationProcessor] Processing notification ${logId} for school ${schoolId} via ${channel}`);

        try {
            // Simulate notification delivery (e.g., calling an external API)
            // In a real app, this is where you'd call SendGrid, Twilio, etc.
            await this.simulateDelivery(channel, recipient, content);

            // Update status to SENT
            await this.notificationRepository.update(logId, {
                status: NotificationStatus.SENT,
            });

            return { success: true };
        } catch (error: any) {
            console.error(`[NotificationProcessor] Delivery failed for ${logId}: ${error.message}`);

            // Update status to FAILED and record error
            await this.notificationRepository.update(logId, {
                status: NotificationStatus.FAILED,
                errorDetails: error.message,
            });

            throw error; // Re-throw to trigger BullMQ retry logic
        }
    }

    private async simulateDelivery(channel: string, recipient: string, content: string): Promise<void> {
        // Simple mock delivery logic
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (recipient.includes('fail')) {
            throw new Error(`Simulated delivery failure for channel ${channel}`);
        }
    }
}
