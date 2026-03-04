import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique, Check } from 'typeorm';
import { EncryptionTransformer } from '@libs/common/transformers/encryption.transformer';

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export enum TransactionType {
    FEE_PAYMENT = 'FEE_PAYMENT',
    PAYROLL = 'PAYROLL',
    GENERAL = 'GENERAL',
}

@Entity('transactions')
@Index(['schoolId'])
@Unique(['schoolId', 'idempotencyKey'])
@Check('amount >= 0')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'student_id', type: 'uuid' })
    studentId: string;

    @Column('decimal')
    amount: number;

    @Column()
    currency: string;

    @Column({
        type: 'varchar',
        default: 'PENDING',
    })
    status: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.GENERAL
    })
    type: TransactionType;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @Column({ name: 'payment_method', nullable: true })
    paymentMethod: string;

    @Column({ name: 'idempotency_key', nullable: true })
    idempotencyKey: string;

    @Column({ name: 'audit_data', type: 'jsonb', nullable: true })
    auditData: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;
}
