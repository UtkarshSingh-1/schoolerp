import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, Check } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('ledger_entries')
@Index(['schoolId'])
@Index(['transactionId'])
@Check('amount >= 0')
export class Ledger {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId!: string;

    @Column({ name: 'transaction_id', type: 'uuid' })
    transactionId!: string;

    @Column({ name: 'debit_account' })
    debitAccount!: string; // e.g., 'CASH', 'STUDENT_WALLET'

    @Column({ name: 'credit_account' })
    creditAccount!: string; // e.g., 'TUITION_REVENUE', 'CASH'

    @Column('decimal', { precision: 12, scale: 2 })
    amount!: number;

    @Column({ default: 'INR' })
    currency: string = 'INR';

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: any;
}
