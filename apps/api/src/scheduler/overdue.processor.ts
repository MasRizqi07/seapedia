import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SchedulerService } from './scheduler.service';
import { Logger } from '@nestjs/common';

@Processor('overdue-check')
export class OverdueProcessor extends WorkerHost {
  private readonly logger = new Logger(OverdueProcessor.name);

  constructor(private readonly schedulerService: SchedulerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'run-sweep') {
      return this.schedulerService.runOverdueCheck();
    }
  }
}
