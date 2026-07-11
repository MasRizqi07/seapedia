import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { OrderStatus, WalletTxType } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private systemConfig: SystemConfigService,
    @InjectQueue('overdue-check') private overdueQueue: Queue
  ) {}

  async onModuleInit() {
    // Register the repeatable job every 5 minutes
    await this.overdueQueue.add(
      'run-sweep',
      {},
      {
        repeat: {
          pattern: '*/5 * * * *',
        },
        jobId: 'system-overdue-sweep', // ensures uniqueness
      }
    );
    this.logger.log('Scheduled overdue-check repeatable job');
  }

  async runOverdueCheck() {
    this.logger.log('Running overdue check sweep...');
    const effectiveNow = this.systemConfig.effectiveNow();

    // Find overdue orders
    const overdueOrders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.WAITING_DRIVER, OrderStatus.SHIPPING] },
        slaDueAt: { lt: effectiveNow },
      },
      include: { items: true },
    });

    if (overdueOrders.length === 0) {
      this.logger.log('No overdue orders found.');
      return { processed: 0 };
    }

    this.logger.log(`Found ${overdueOrders.length} overdue orders. Processing refunds...`);

    let processedCount = 0;

    for (const order of overdueOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Double check status to ensure idempotency
          const currentOrder = await tx.order.findUnique({ where: { id: order.id } });
          if (!currentOrder || (currentOrder.status !== OrderStatus.WAITING_DRIVER && currentOrder.status !== OrderStatus.SHIPPING)) {
            return; // skip, already processed
          }

          // 1. Update order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.RETURNED,
              history: {
                create: {
                  status: OrderStatus.RETURNED,
                  note: 'Dikembalikan: Pesanan melewati batas waktu (SLA breached)',
                }
              }
            }
          });

          // 2. Refund wallet
          await tx.walletTransaction.create({
            data: {
              wallet: { connect: { buyerId: order.buyerId } },
              type: WalletTxType.REFUND,
              amount: order.totalAmount,
              referenceOrderId: `REFUND-${order.id}`,
            }
          });
          
          await tx.wallet.update({
            where: { buyerId: order.buyerId },
            data: { balance: { increment: order.totalAmount } },
          });

          // 3. Restore product stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
        processedCount++;
      } catch (err) {
        this.logger.error(`Failed to process overdue order ${order.id}`, err);
      }
    }

    this.logger.log(`Completed overdue check. Processed ${processedCount} orders.`);
    return { processed: processedCount };
  }
}
