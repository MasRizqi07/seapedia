import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@seapedia/types';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private systemConfig: SystemConfigService,
  ) {}

  async getAvailableJobs() {
    return this.prisma.deliveryJob.findMany({
      where: { status: 'AVAILABLE', driverId: null },
      include: {
        order: {
          include: {
            store: true,
          },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });
  }

  async getJobDetails(id: string) {
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            store: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async takeJob(driverId: string, jobId: string) {
    // Prevent taking multiple jobs
    const activeJob = await this.prisma.deliveryJob.findFirst({
      where: { driverId, status: 'TAKEN' },
    });

    if (activeJob) {
      throw new BadRequestException('You already have an active job. Complete it first.');
    }

    // Atomic claim via updateMany
    const result = await this.prisma.deliveryJob.updateMany({
      where: {
        id: jobId,
        status: 'AVAILABLE',
        driverId: null,
      },
      data: {
        driverId,
        status: 'TAKEN',
        takenAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new ConflictException('Job is no longer available or already taken by another driver.');
    }

    // Now that we securely own the job, we can update the related order inside a transaction
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found after taking it. This should not happen.');
    }

    const effectiveNow = this.systemConfig.effectiveNow();
    let slaMs = 0;
    if (job.order.deliveryMethod === 'INSTANT') slaMs = 3 * 3600 * 1000;
    else if (job.order.deliveryMethod === 'NEXT_DAY') slaMs = 24 * 3600 * 1000;
    else if (job.order.deliveryMethod === 'REGULAR') slaMs = 72 * 3600 * 1000;

    const slaDueAt = new Date(effectiveNow.getTime() + slaMs);

    await this.prisma.order.update({
      where: { id: job.orderId },
      data: {
        status: OrderStatus.SHIPPING,
        slaDueAt,
        history: {
          create: {
            status: OrderStatus.SHIPPING,
            note: 'Pesanan sedang diantar oleh kurir',
          },
        },
      },
    });

    return { success: true, jobId };
  }

  async completeJob(driverId: string, jobId: string) {
    const job = await this.prisma.deliveryJob.findUnique({
      where: { id: jobId },
    });

    if (!job || job.driverId !== driverId) {
      throw new NotFoundException('Job not found or not owned by you');
    }
    if (job.status !== 'TAKEN') {
      throw new BadRequestException('Job is not in TAKEN status');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.deliveryJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: job.orderId },
        data: {
          status: OrderStatus.COMPLETED,
          history: {
            create: {
              status: OrderStatus.COMPLETED,
              note: 'Pesanan telah selesai diantar',
            },
          },
        },
      });
    });

    return { success: true, jobId };
  }

  async getEarnings(driverId: string) {
    const result = await this.prisma.deliveryJob.aggregate({
      where: { driverId, status: 'COMPLETED' },
      _sum: { earnings: true },
    });
    return { total: result._sum.earnings || 0 };
  }

  async getJobHistory(driverId: string) {
    return this.prisma.deliveryJob.findMany({
      where: { driverId, status: 'COMPLETED' },
      include: {
        order: {
          include: {
            store: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getActiveJob(driverId: string) {
    const job = await this.prisma.deliveryJob.findFirst({
      where: { driverId, status: 'TAKEN' },
      include: {
        order: {
          include: {
            store: true,
            items: {
              include: { product: true },
            },
          },
        },
      },
    });
    return job || null;
  }
}
