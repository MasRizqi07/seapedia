import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface PingableRedisClient {
  status?: string;
  ping?: () => Promise<string>;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('overdue-check') private readonly overdueQueue: Queue,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Deep system healthcheck (Database & Redis)' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async check() {
    let database: 'up' | 'down' = 'down';
    let redis: 'up' | 'degraded' = 'degraded';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }

    try {
      const client = (await this.overdueQueue.client) as unknown as PingableRedisClient;
      if (client?.status === 'ready') {
        redis = 'up';
      } else if (typeof client?.ping === 'function') {
        const pong = await Promise.race([
          client.ping(),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
        if (pong === 'PONG') {
          redis = 'up';
        }
      }
    } catch {
      redis = 'degraded';
    }

    const status = database === 'up' ? 'ok' : 'error';

    return {
      status,
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}
