import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ViolationSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum ViolationRecordStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    REVIEWED = 'REVIEWED',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED',
}

@Entity('violation_records')
@Index(['schoolId'])
@Index(['studentId'])
@Index(['examAttemptId'])
export class ViolationRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    schoolId: string;

    @Column({ type: 'uuid' })
    studentId: string;

    @Column({ type: 'uuid' })
    examAttemptId: string;

    @Column()
    type: string; // e.g., 'MULTIPLE_TAB_SWITCH', 'PROLONGED_FACE_MISMATCH'

    @Column({
        type: 'enum',
        enum: ViolationSeverity,
        default: ViolationSeverity.LOW,
    })
    severity: ViolationSeverity;

    @Column({
        type: 'enum',
        enum: ViolationRecordStatus,
        default: ViolationRecordStatus.PENDING_REVIEW,
    })
    status: ViolationRecordStatus;

    @Column({ type: 'text', nullable: true })
    resolutionNotes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'uuid', nullable: true })
    reviewedBy: string;
}
