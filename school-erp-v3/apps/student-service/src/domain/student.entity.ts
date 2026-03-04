import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { EncryptionTransformer } from '@libs/common/transformers/encryption.transformer';

@Entity('students')
@Index(['schoolId'])
@Index(['schoolId', 'admissionNumber'], { unique: true })
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId!: string;

    @Column({ name: 'admission_no' })
    admissionNumber!: string;

    @Column({ name: 'first_name' })
    firstName!: string;

    @Column({ name: 'last_name' })
    lastName!: string;

    @Column({
        name: 'national_id',
        nullable: true,
        transformer: new EncryptionTransformer()
    })
    nationalId?: string;

    @Column({ name: 'full_name', nullable: true })
    fullName?: string;

    @Column({ name: 'date_of_birth', type: 'date', nullable: true })
    dateOfBirth?: Date;

    @Column({ nullable: true })
    gender?: string;

    @Column({ name: 'current_class_id', type: 'uuid', nullable: true })
    classId?: string;

    @Column({ name: 'parent_contact' })
    parentContact!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy?: string;

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy?: string;
}
