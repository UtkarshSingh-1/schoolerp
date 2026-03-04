import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('roles')
@Index(['schoolId'])
@Index(['schoolId', 'name'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column()
    name: string;

    @Column({ type: 'jsonb', default: [] })
    permissions: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
