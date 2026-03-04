import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ViolationType {
    TAB_SWITCH = 'TAB_SWITCH',
    FACE_MISMATCH = 'FACE_MISMATCH',
    MULTIPLE_PERSONS = 'MULTIPLE_PERSONS',
    NO_PERSON_DETECTED = 'NO_PERSON_DETECTED',
    UNAUTHORIZED_DEVICE = 'UNAUTHORIZED_DEVICE',
    OTHER = 'OTHER',
}

@Entity('proctoring_events')
@Index(['schoolId'])
@Index(['examAttemptId'])
export class ProctoringEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    schoolId: string;

    @Column({ type: 'uuid' })
    examAttemptId: string;

    @Column({
        type: 'enum',
        enum: ViolationType,
    })
    type: ViolationType;

    @Column({ type: 'text', nullable: true })
    details: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any; // Captures screenshot URL or detection confidence

    @CreateDateColumn()
    createdAt: Date;
}
