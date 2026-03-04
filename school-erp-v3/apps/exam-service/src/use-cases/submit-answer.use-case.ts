import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAttempt, ExamAttemptStatus } from '../domain/exam-attempt.entity';
import { ExamResponse } from '../domain/exam-response.entity';
import { getSchoolId } from '../../../../libs/tenant/src/tenant.context';

@Injectable()
export class SubmitAnswerUseCase {
    constructor(
        @InjectRepository(ExamAttempt)
        private readonly attemptRepository: Repository<ExamAttempt>,
        @InjectRepository(ExamResponse)
        private readonly responseRepository: Repository<ExamResponse>
    ) { }

    async execute(attemptId: string, questionId: string, answer: string): Promise<ExamResponse> {
        const schoolId = getSchoolId();

        // 1. Fetch attempt and verify status
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId, schoolId }
        });

        if (!attempt) throw new NotFoundException('Exam attempt not found');

        // PRODUCTION HARDENING: Mandatory mutation lock
        if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException(`Exam has been ${attempt.status.toLowerCase()}. No further answers accepted.`);
        }

        // 2. Save or Update response
        let response = await this.responseRepository.findOne({
            where: { attemptId, questionId, schoolId }
        });

        if (response) {
            response.answer = answer;
        } else {
            response = this.responseRepository.create({
                schoolId,
                attemptId,
                questionId,
                answer
            });
        }

        return this.responseRepository.save(response);
    }
}
