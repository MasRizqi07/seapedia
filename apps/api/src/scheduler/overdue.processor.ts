import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SchedulerService } from './scheduler.service';
import { Logger, OnModuleInit } from '@nestjs/common';

@Processor('overdue-check')
export class OverdueProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(OverdueProcessor.name);

  constructor(private readonly schedulerService: SchedulerService) {
    super();
  }

  onModuleInit() {
    this.worker.on('error', (err: Error) => {
      this.logger.debug(`Worker Redis connection error: ${err.message}`);
    });
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'run-sweep') {
      return this.schedulerService.runOverdueCheck();
    }
  }
}
