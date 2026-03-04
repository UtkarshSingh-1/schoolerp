import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExamAttempt } from '../domain/exam-attempt.entity';
import { User } from '@app/auth-service/domain/user.entity';

@Injectable()
export class ListExamResultsUseCase {
    constructor(private readonly dataSource: DataSource) { }

    async execute(schoolId: string, examId: string) {
        // PROOF: High-performance join for real-time ranking
        const results = await this.dataSource.getRepository(ExamAttempt)
            .createQueryBuilder('attempt')
            .leftJoin('users', 'user', 'user.id = attempt.student_id')
            .select([
                'user.full_name as name',
                'attempt.score as score',
                'attempt.status as status',
                'attempt.submitted_at as date'
            ])
            .where('attempt.school_id = :schoolId', { schoolId })
            .andWhere('attempt.exam_id = :examId', { examId })
            .andWhere('attempt.status IN (:...statuses)', { statuses: ['SUBMITTED', 'GRADED'] })
            .orderBy('attempt.score', 'DESC')
            .getRawMany();

        return results;
    }
}
