import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BaseTenantProcessor } from '@libs/tenant/base-tenant.processor';
import { GenerateStudentReportUseCase } from '../use-cases/generate-student-report.use-case';

@Processor('reports')
export class ReportProcessor extends BaseTenantProcessor {
  constructor(private readonly generateStudentReportUseCase: GenerateStudentReportUseCase) {
    super();
  }

  async handleJob(job: Job<any>): Promise<any> {
    switch (job.name) {
      case 'generate-student-report':
        return this.generateStudentReportUseCase.execute(job.data);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  protected getDlqQueueName(): string {
    return 'reports-dlq';
  }
}
