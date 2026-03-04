import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum LeaveStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export enum LeaveType {
    SICK = 'SICK',
    CASUAL = 'CASUAL',
    EARNED = 'EARNED',
    STUDY = 'STUDY',
    OTHER = 'OTHER',
}

@Entity('leave_requests')
@Index(['schoolId'])
export class LeaveRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    schoolId: string;

    @Column({ type: 'uuid' })
    userId: string; // The person applying for leave

    @Column({
        type: 'enum',
        enum: LeaveType,
        default: LeaveType.CASUAL,
    })
    type: LeaveType;

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({
        type: 'enum',
        enum: LeaveStatus,
        default: LeaveStatus.PENDING,
    })
    status: LeaveStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'uuid', nullable: true })
    approvedBy: string;

    @Column({ type: 'uuid', nullable: true })
    updatedBy: string;
}
