import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('payroll_records')
@Index(['schoolId'])
@Index(['staffId'])
export class PayrollRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'staff_id', type: 'uuid' })
    staffId: string;

    @Column({ name: 'salary_structure_id', type: 'uuid' })
    salaryStructureId: string;

    @Column()
    month: string; // e.g., '2026-02'

    @Column({ name: 'net_amount', type: 'decimal', precision: 12, scale: 2 })
    netAmount: number;

    @Column({ default: 'PENDING' })
    status: string; // PENDING, PAID, VOID

    @Column({ name: 'processed_at', type: 'timestamp with time zone', nullable: true })
    processedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
