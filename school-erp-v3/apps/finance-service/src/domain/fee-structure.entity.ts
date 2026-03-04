import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FeeFrequency {
    ONCE = 'ONCE',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

@Entity('fee_structures')
@Index(['schoolId'])
export class FeeStructure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column()
    name: string; // e.g., 'Tuition Fee 2026', 'Transport Fee'

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: FeeFrequency,
        default: FeeFrequency.MONTHLY
    })
    frequency: FeeFrequency;

    @Column({ name: 'grade_level', nullable: true })
    gradeLevel: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
