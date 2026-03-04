import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('lecture_schedules')
@Index(['schoolId'])
@Index(['teacherId'])
@Index(['subjectId'])
export class LectureSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
    teacherId: string;

    @Column({ name: 'subject_id', type: 'uuid', nullable: true })
    subjectId: string;

    @Column({ name: 'class_id', type: 'uuid', nullable: true })
    classId: string;

    @Column({ name: 'day_of_week' })
    dayOfWeek: string;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ name: 'room_number', nullable: true })
    roomNumber: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
