import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['schoolId'])
@Index(['schoolId', 'email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column()
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ name: 'role_id', type: 'uuid', nullable: true })
    roleId: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
