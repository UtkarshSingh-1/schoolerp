import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique, Check } from 'typeorm';

export enum ExamAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED', // Terminated by proctoring engine
}

@Entity('exam_attempts')
@Index(['schoolId'])
@Index(['studentId'])
@Index(['examId'])
@Unique(['studentId', 'examId', 'status']) // Simplified for one active session enforcement
@Check('risk_score >= 0')
export class ExamAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Column({
    type: 'varchar',
    default: 'IN_PROGRESS',
  })
  status: string;

  @Column({ name: 'started_at', type: 'timestamp with time zone', nullable: true })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp with time zone', nullable: true })
  submittedAt: Date;

  @Column({ name: 'violation_count', type: 'int', default: 0 })
  violationCount: number;

  @Column({ name: 'auto_submit_reason', nullable: true })
  autoSubmitReason: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'device_fingerprint', nullable: true })
  deviceFingerprint: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ name: 'grade', nullable: true })
  grade: string;

  @Column({ name: 'total_questions', type: 'int', nullable: true })
  totalQuestions: number;

  @Column({ name: 'correct_answers', type: 'int', nullable: true })
  correctAnswers: number;

  @Column({ name: 'violation_history', type: 'jsonb', nullable: true })
  violationHistory: any[];
}
