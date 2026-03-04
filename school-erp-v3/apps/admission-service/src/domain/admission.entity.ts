import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AdmissionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WAITLISTED = 'WAITLISTED',
}

@Entity('admissions')
@Index(['schoolId'])
export class Admission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    schoolId: string;

    @Column()
    applicantFullName: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'uuid' })
    targetClassId: string;

    @Column({
        type: 'enum',
        enum: AdmissionStatus,
        default: AdmissionStatus.PENDING,
    })
    status: AdmissionStatus;

    @Column({ type: 'text', nullable: true })
    remarks: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @Column({ type: 'uuid', nullable: true })
    processedBy: string;

    @Column({ type: 'uuid', nullable: true })
    updatedBy: string;
}
