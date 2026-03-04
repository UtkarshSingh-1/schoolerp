import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSchoolId } from '@libs/tenant/tenant.context';
import { ExamRepository, ExamAttemptRepository } from '../infrastructure/exam.repository';
import { StartExamDto } from '../presentation/dto/start-exam.dto';
import { ExamAttempt } from '../domain/exam-attempt.entity';

@Injectable()
export class StartExamUseCase {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly attemptRepository: ExamAttemptRepository
  ) { }

  async execute(dto: StartExamDto, studentId: string, ipAddress: string): Promise<ExamAttempt> {
    const schoolId = getSchoolId();
    if (!schoolId) throw new ForbiddenException('Tenant context missing');

    // 1. Fetch Exam and Validate Timing
    const exam = await this.examRepository.findOne({ where: { id: dto.examId, schoolId } });
    if (!exam) throw new BadRequestException('Exam not found');

    const now = new Date();
    if (now < exam.startTime) throw new ForbiddenException('Exam has not started yet');
    if (now > exam.endTime) throw new ForbiddenException('Exam has already ended');

    // 2. Check for Active Session
    const activeAttempt = await this.attemptRepository.findActiveAttempt(schoolId, studentId, dto.examId);
    if (activeAttempt) {
      throw new ForbiddenException('Multiple active sessions are not allowed');
    }

    // 3. Log Attempt with Proctoring Metadata
    return this.attemptRepository.createAttempt(schoolId, {
      examId: dto.examId,
      studentId,
      ipAddress,
      deviceFingerprint: dto.deviceFingerprint,
    });
  }
}
