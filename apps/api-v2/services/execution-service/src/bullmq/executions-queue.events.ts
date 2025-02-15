// import { Logger } from '@nestjs/common';
// import {
//   OnQueueEvent,
//   QueueEventsHost,
//   QueueEventsListener,
// } from '@nestjs/bullmq';
//
// @QueueEventsListener('executions')
// export class ExecutionsQueueEventsListener extends QueueEventsHost {
//   private logger = new Logger('QUEUE');
//
//   @OnQueueEvent('added')
//   onAdded(job: { id: string; name: string }) {
//     this.logger.debug(`Job with ID ${job.id} added to queue -> ${job.name}!`);
//   }
//
//   @OnQueueEvent('drained')
//   onDrained(drainedHash: string | number) {
//     this.logger.debug(`Job ${drainedHash} drained from queue!`);
//   }
// }
