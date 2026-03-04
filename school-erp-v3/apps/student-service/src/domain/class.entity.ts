import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('classes')
@Index(['schoolId'])
@Index(['schoolId', 'name', 'section'], { unique: true })
export class Class {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column()
    name: string;

    @Column()
    section: string;

    @Column({ name: 'maximum_capacity', default: 40 })
    maximumCapacity: number;

    @Column({ name: 'current_enrollment', default: 0 })
    currentEnrollment: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
