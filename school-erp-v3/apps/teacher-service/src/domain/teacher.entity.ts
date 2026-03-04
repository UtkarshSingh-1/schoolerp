import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { EncryptionTransformer } from '@libs/common/transformers/encryption.transformer';

@Entity('teachers')
@Index(['schoolId'])
export class Teacher {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'user_id', type: 'uuid', unique: true })
    userId: string;

    @Column({ name: 'employee_id', unique: true })
    employeeId: string;

    @Column({ name: 'full_name', nullable: true })
    fullName: string;

    @Column({
        name: 'national_id',
        nullable: true,
        transformer: new EncryptionTransformer()
    })
    nationalId: string;

    @Column({ name: 'specialization', type: 'text', nullable: true })
    specialization: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy: string;
}
