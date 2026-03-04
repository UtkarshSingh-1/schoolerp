import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('salary_structures')
@Index(['schoolId'])
export class SalaryStructure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'staff_id', type: 'uuid' })
    staffId: string;

    @Column({ name: 'base_salary', type: 'decimal', precision: 12, scale: 2 })
    baseSalary: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    allowances: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductions: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
