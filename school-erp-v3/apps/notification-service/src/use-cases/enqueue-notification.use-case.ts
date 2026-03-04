import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { SendNotificationDto } from '../presentation/dto/send-notification.dto';
import { NotificationLog, NotificationStatus } from '../domain/notification-log.entity';
import { getSchoolId } from '../../../../libs/tenant/src/tenant.context';

@Injectable()
export class EnqueueNotificationUseCase {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        @InjectQueue('notifications') private notificationQueue: Queue
    ) { }

    async execute(dto: SendNotificationDto): Promise<NotificationLog> {
        const schoolId = getSchoolId();
        if (!schoolId) {
            throw new Error('Tenant context missing for notification enqueueing');
        }

        // 1. Create a log entry in QUEUED status
        // Pass schoolId as first argument as per refactored repository
        const log = await this.notificationRepository.createLog(schoolId, {
            ...dto,
            status: NotificationStatus.QUEUED,
        });

        // 2. Add to BullMQ for background processing
        // IDEMPOTENCY: Use log.id as jobId to prevent duplicate processing
        await this.notificationQueue.add('send-notification', {
            logId: log.id,
            schoolId: schoolId,
            ...dto,
        }, {
            jobId: log.id, // BullMQ native idempotency
        });

        return log;
    }
}
