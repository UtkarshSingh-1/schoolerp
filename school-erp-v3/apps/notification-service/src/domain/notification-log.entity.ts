import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationStatus {
    QUEUED = 'QUEUED',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

export enum NotificationChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH',
}

@Entity('notification_logs')
@Index(['schoolId'])
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    schoolId: string;

    @Column()
    recipient: string;

    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.QUEUED,
    })
    status: NotificationStatus;

    @Column({ type: 'text', nullable: true })
    errorDetails: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
