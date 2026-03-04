import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportProcessor } from './processors/report.processor';
import { GenerateStudentReportUseCase } from './use-cases/generate-student-report.use-case';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reports',
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [
    ReportProcessor,
    GenerateStudentReportUseCase,
  ],
})
export class WorkerModule { }
