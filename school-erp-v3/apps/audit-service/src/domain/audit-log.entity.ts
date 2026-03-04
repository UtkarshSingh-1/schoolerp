import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    ACCESS = 'ACCESS',
}

@Entity('audit_logs')
@Index(['schoolId'])
@Index(['userId'])
@Index(['resource'])
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column({ name: 'entity_name' })
    resource: string; // e.g., 'STUDENT', 'FINANCE', 'EXAM'

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    resourceId: string;

    @Column({ name: 'new_values', type: 'jsonb', nullable: true })
    payload: any; // Captures before/after state or important metadata

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    // userAgent column missing in current DB schema, omitting mapping to avoid errors
    userAgent?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
