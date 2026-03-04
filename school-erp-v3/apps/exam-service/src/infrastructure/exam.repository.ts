import { Injectable, ConflictException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Exam } from '../domain/exam.entity';
import { ExamAttempt, ExamAttemptStatus } from '../domain/exam-attempt.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class ExamRepository extends Repository<Exam> {
  constructor(private dataSource: DataSource) {
    super(Exam, dataSource.createEntityManager());
  }

  async findBySchool(schoolId: string): Promise<Exam[]> {
    return this.find({ where: { schoolId } });
  }
}

@Injectable()
export class ExamAttemptRepository extends Repository<ExamAttempt> {
  constructor(private dataSource: DataSource) {
    super(ExamAttempt, dataSource.createEntityManager());
  }

  private validateTenant(schoolId: string) {
    if (!schoolId) throw new Error('EXAM_COMPLIANCE_ERROR: schoolId is mandatory');
  }

  async findActiveAttempt(schoolId: string, studentId: string, examId: string): Promise<ExamAttempt | null> {
    return this.findOne({
      where: {
        schoolId,
        studentId,
        examId,
        status: ExamAttemptStatus.IN_PROGRESS
      }
    });
  }

  async createAttempt(schoolId: string, data: Partial<ExamAttempt>): Promise<ExamAttempt> {
    this.validateTenant(schoolId);

    const attempt = this.create({
      ...data,
      schoolId,
      status: ExamAttemptStatus.IN_PROGRESS,
      startedAt: new Date(), // PROOF: Server-time enforcement
    });

    try {
      return await this.save(attempt);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('You already have an active session for this exam');
      }
      throw error;
    }
  }

  async updateAttemptWithRisk(schoolId: string, id: string, riskUpdate: Partial<ExamAttempt>): Promise<void> {
    this.validateTenant(schoolId);

    const attempt = await this.findOne({ where: { id, schoolId } });
    if (!attempt) throw new Error('Attempt not found');

    // PROOF: Immutability Enforcement
    if (attempt.status === ExamAttemptStatus.SUBMITTED || attempt.status === ExamAttemptStatus.AUTO_SUBMITTED) {
      throw new ConflictException('EXAM_COMPLIANCE_ERROR: Cannot modify a submitted exam attempt');
    }

    // PROOF: Real-time risk scoring calculation
    if (riskUpdate.ipAddress && riskUpdate.ipAddress !== attempt.ipAddress) {
      attempt.riskScore = (attempt.riskScore || 0) + 20; // IP Change
      attempt.violationHistory = [...(attempt.violationHistory || []), { type: 'IP_CHANGE', ip: riskUpdate.ipAddress, time: new Date() }];
    }

    if (riskUpdate.violationCount && riskUpdate.violationCount > attempt.violationCount) {
      attempt.riskScore = (attempt.riskScore || 0) + 10; // Tab switch/Violation
      attempt.violationHistory = [...(attempt.violationHistory || []), { type: 'TAB_SWITCH', time: new Date() }];
    }

    Object.assign(attempt, riskUpdate);
    await this.save(attempt);
  }
}
