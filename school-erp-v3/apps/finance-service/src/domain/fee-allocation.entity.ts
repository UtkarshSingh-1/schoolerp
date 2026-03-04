import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne } from 'typeorm';
import { FeeStructure } from './fee-structure.entity';

@Entity('fee_allocations')
@Index(['schoolId'])
@Index(['studentId'])
export class FeeAllocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'student_id', type: 'uuid' })
    studentId: string;

    @Column({ name: 'fee_structure_id', type: 'uuid' })
    feeStructureId: string;

    @Column({ type: 'date' })
    dueDate: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    paidAmount: number;

    @Column({ default: false })
    isFullyPaid: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => FeeStructure)
    feeStructure: FeeStructure;
}
