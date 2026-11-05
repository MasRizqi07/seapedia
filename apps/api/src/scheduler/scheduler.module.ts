import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulerService } from './scheduler.service';
import { OverdueProcessor } from './overdue.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    PrismaModule,
    SystemConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        enableOfflineQueue: false,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 500, 2000)),
      },
    }),
    BullModule.registerQueue({
      name: 'overdue-check',
    }),
  ],
  providers: [SchedulerService, OverdueProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}
