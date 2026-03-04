import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { runWithSchoolId } from '@libs/tenant/tenant.context';

export abstract class BaseTenantProcessor extends WorkerHost {
  async process(job: Job<any>, token?: string): Promise<any> {
    const { schoolId } = job.data;
    if (!schoolId) {
      throw new Error(`Job ${job.id} missing schoolId context`);
    }

    return runWithSchoolId(schoolId, () => this.handleJob(job, token));
  }

  abstract handleJob(job: Job<any>, token?: string): Promise<any>;

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed: ${error.message}`);
  }
}
