import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne } from 'typeorm';
import { ExamAttempt } from './exam-attempt.entity';

@Entity('exam_responses')
@Index(['attemptId'])
@Index(['schoolId'])
export class ExamResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    schoolId: string;

    @Column({ type: 'uuid' })
    attemptId: string;

    @Column({ type: 'uuid' })
    questionId: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ name: 'is_correct', type: 'boolean', default: false })
    isCorrect: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => ExamAttempt)
    attempt: ExamAttempt;
}
