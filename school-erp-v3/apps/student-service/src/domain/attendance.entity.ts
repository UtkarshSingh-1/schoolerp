import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    EXCUSED = 'EXCUSED',
}

@Entity('attendance')
@Index(['schoolId'])
@Index(['studentId'])
@Index(['date'])
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'student_id', type: 'uuid' })
    studentId: string;

    @Column({ name: 'lecture_id', type: 'uuid', nullable: true })
    lectureId: string;

    @Column({ type: 'date' })
    date: string;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT,
    })
    status: AttendanceStatus;

    @Column({ nullable: true })
    remarks: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'marked_by', type: 'uuid', nullable: true })
    markedBy: string;
}
