import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExecutionsService } from '@/execution.service';

@Processor('executions', { concurrency: 20 })
export class ExecutionsWorker extends WorkerHost {
  constructor(private readonly executionsService: ExecutionsService) {
    super();
  }

  // Static named function to process the job
  async process(job: Job) {
    console.log('Processing job', job.id);
    await this.executionsService.executeWorkflow(job.data);
  }

  // EVENT LISTENERS FROM BULLMQ -> better to move them to the ExecutionsQueueEventsListener
  // @OnWorkerEvent('active')
  // onAdded(job: Job) {
  //   console.log('Job added', job.id);
  // }
  //
  // @OnWorkerEvent('completed')
  // onCompleted(job: Job) {
  //   console.log('Job completed', job.id);
  // }
  //
  // @OnWorkerEvent('failed')
  // onFailed(job: Job) {
  //   console.log('Job failed', job.id);
  // }
}
