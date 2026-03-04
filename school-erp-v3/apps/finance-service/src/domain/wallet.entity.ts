import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('wallets')
@Index(['schoolId', 'studentId'])
@Unique(['schoolId', 'studentId'])
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    schoolId!: string;

    @Column({ type: 'uuid' })
    studentId!: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance: number = 0;

    @Column({ default: 'INR' })
    currency: string = 'INR';

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
