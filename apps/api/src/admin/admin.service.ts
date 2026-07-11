import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { AdminStatsResponse } from '@seapedia/types';
import { JobStatus, OrderStatus, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private systemConfig: SystemConfigService,
    private scheduler: SchedulerService
  ) {}

  async getStats(): Promise<AdminStatsResponse> {
    const [
      users,
      stores,
      products,
      orders,
      vouchers,
      promos,
      jobs
    ] = await Promise.all([
      this.prisma.userRole.groupBy({ by: ['role'], _count: { role: true } }),
      this.prisma.store.count(),
      this.prisma.product.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
      this.prisma.voucher.findMany(),
      this.prisma.promo.findMany(),
      this.prisma.deliveryJob.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const effectiveNow = this.systemConfig.effectiveNow();

    const overdueCount = await this.prisma.order.count({
      where: {
        status: { in: [OrderStatus.WAITING_DRIVER, OrderStatus.SHIPPING] },
        slaDueAt: { lt: effectiveNow },
      }
    });

    const userByRole = users.reduce((acc: Record<Role, number>, curr) => {
      acc[curr.role] = curr._count.role;
      return acc;
    }, {} as Record<Role, number>);

    const orderByStatus = orders.reduce((acc: Record<OrderStatus, number>, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const jobsByStatus = jobs.reduce((acc: Record<JobStatus, number>, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<JobStatus, number>);

    const totalUsers = Object.values(userByRole).reduce((a: number, b: number) => a + b, 0);
    const totalOrders = Object.values(orderByStatus).reduce((a: number, b: number) => a + b, 0);
    const totalJobs = Object.values(jobsByStatus).reduce((a: number, b: number) => a + b, 0);

    const activeVouchers = vouchers.filter((v: any) => v.expiryDate > effectiveNow).length;
    const activePromos = promos.filter((p: any) => p.expiryDate > effectiveNow).length;

    return {
      users: { total: totalUsers, byRole: userByRole },
      stores,
      products,
      orders: { total: totalOrders, byStatus: orderByStatus, overdueCount },
      vouchers: { active: activeVouchers, expired: vouchers.length - activeVouchers },
      promos: { active: activePromos, expired: promos.length - activePromos },
      jobs: { total: totalJobs, byStatus: jobsByStatus },
    };
  }

  async simulateNextDay() {
    const newTime = await this.systemConfig.simulateNextDay();
    return { effectiveNow: newTime };
  }

  async runOverdueCheck() {
    return this.scheduler.runOverdueCheck();
  }

  async getOverdueOrders() {
    const effectiveNow = this.systemConfig.effectiveNow();
    return this.prisma.order.findMany({
      where: {
        OR: [
          { status: OrderStatus.RETURNED },
          { 
            status: { in: [OrderStatus.WAITING_DRIVER, OrderStatus.SHIPPING] },
            slaDueAt: { lt: effectiveNow }
          }
        ]
      },
      include: {
        store: true,
        items: { include: { product: true } },
        history: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
