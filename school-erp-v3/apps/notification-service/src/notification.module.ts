import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NotificationLog } from './domain/notification-log.entity';
import { NotificationRepository } from './infrastructure/notification.repository';
import { EnqueueNotificationUseCase } from './use-cases/enqueue-notification.use-case';
import { NotificationController } from './presentation/notification.controller';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationLog]),
        BullModule.registerQueue({
            name: 'notifications',
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: true,    // AUDIT FIX: We use a true DLQ now
            },
        }),
        BullModule.registerQueue({
            name: 'notifications-dlq', // PROOF: Dedicated DLQ
            defaultJobOptions: {
                removeOnComplete: false,
                removeOnFail: false,
            }
        }),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationRepository,
        EnqueueNotificationUseCase,
        NotificationProcessor,
    ],
    exports: [EnqueueNotificationUseCase],
})
export class NotificationModule { }
