import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('exams')
@Index(['schoolId'])
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column()
  title: string;

  @Column({ name: 'start_time', type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone' })
  endTime: Date;

  @Column({ name: 'proctoring_enabled', default: true })
  proctoringEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
