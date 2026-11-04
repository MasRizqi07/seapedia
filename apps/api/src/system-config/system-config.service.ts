import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private configId: string | null = null;
  private offsetCache: number = 0;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    let config = await this.prisma.systemConfig.findFirst();
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: { clockOffsetMs: 0 },
      });
    }
    this.configId = config.id;
    this.offsetCache = config.clockOffsetMs;
  }

  // Reload offset from DB
  async reloadConfig() {
    if (!this.configId) return;
    const config = await this.prisma.systemConfig.findUnique({
      where: { id: this.configId },
    });
    if (config) {
      this.offsetCache = config.clockOffsetMs;
    }
  }

  effectiveNow(): Date {
    return new Date(Date.now() + this.offsetCache);
  }

  async simulateNextDay() {
    if (!this.configId) return;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const config = await this.prisma.systemConfig.update({
      where: { id: this.configId },
      data: { clockOffsetMs: { increment: ONE_DAY_MS } },
    });

    this.offsetCache = config.clockOffsetMs;
    return this.effectiveNow();
  }
}
