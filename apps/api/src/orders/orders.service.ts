import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/order.dto';
import { DeliveryMethod, OrderStatus, WalletTxType } from '@prisma/client';
import { SystemConfigService } from '../system-config/system-config.service';

const DELIVERY_FEES = {
  [DeliveryMethod.INSTANT]: 25000,
  [DeliveryMethod.NEXT_DAY]: 15000,
  [DeliveryMethod.REGULAR]: 10000,
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private systemConfig: SystemConfigService,
  ) {}

  async checkout(buyerId: string, dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch and validate cart
      const cart = await tx.cart.findUnique({
        where: { buyerId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0 || !cart.storeId) {
        throw new BadRequestException('Cart is empty');
      }

      // 2. Validate address
      const address = await tx.address.findUnique({
        where: { id: dto.addressId },
      });

      if (!address || address.buyerId !== buyerId) {
        throw new NotFoundException('Delivery address not found');
      }

      // 3. Compute Totals
      const subtotal = cart.items.reduce(
        (acc, item) => acc + item.quantity * item.product.price,
        0,
      );

      let discountAmount = 0;
      let voucherId = null;
      let promoId = null;

      if (dto.discountCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: dto.discountCode } });
        if (voucher) {
          if (voucher.expiryDate < new Date()) throw new BadRequestException('Voucher expired');
          if (voucher.usedCount >= voucher.usageLimit)
            throw new BadRequestException('Voucher usage limit reached');

          discountAmount =
            voucher.discountType === 'FIXED'
              ? voucher.value
              : Math.floor(subtotal * (voucher.value / 100));
          voucherId = voucher.id;

          await tx.voucher.update({
            where: { id: voucher.id },
            data: { usedCount: { increment: 1 } },
          });
        } else {
          const promo = await tx.promo.findUnique({ where: { code: dto.discountCode } });
          if (promo) {
            if (promo.expiryDate < new Date()) throw new BadRequestException('Promo expired');

            discountAmount =
              promo.discountType === 'FIXED'
                ? promo.value
                : Math.floor(subtotal * (promo.value / 100));
            promoId = promo.id;
          } else {
            throw new BadRequestException('Invalid discount code');
          }
        }
      }

      if (discountAmount > subtotal) discountAmount = subtotal;

      const deliveryFee = DELIVERY_FEES[dto.deliveryMethod];
      const taxableAmount = subtotal - discountAmount + deliveryFee;
      const ppnAmount = Math.floor(taxableAmount * 0.11);
      const totalAmount = taxableAmount + ppnAmount;

      // 4. Validate Wallet Balance
      const wallet = await tx.wallet.findUnique({
        where: { buyerId },
      });

      if (!wallet || wallet.balance < totalAmount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      // 5. Decrement Stock (with race-condition protection)
      for (const item of cart.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // Prevents negative stock
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (result.count === 0) {
          throw new ConflictException(
            `Insufficient stock for product ${item.product.name}. Required: ${item.quantity}`,
          );
        }
      }

      // 6. Deduct Wallet & Log Transaction
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: totalAmount } },
      });

      const order = await tx.order.create({
        data: {
          buyerId,
          storeId: cart.storeId,
          deliveryMethod: dto.deliveryMethod,
          subtotal,
          discountAmount,
          voucherId,
          promoId,
          deliveryFee,
          ppnAmount,
          totalAmount,
          status: OrderStatus.PACKING,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
          history: {
            create: {
              status: OrderStatus.PACKING,
              note: 'Sedang Dikemas',
            },
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          type: WalletTxType.PAYMENT,
          amount: totalAmount,
          referenceOrderId: order.id,
        },
      });

      // 7. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await tx.cart.update({
        where: { id: cart.id },
        data: { storeId: null },
      });

      return order;
    });
  }

  async getBuyerOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true, imageUrl: true } } } },
      },
    });
  }

  async getBuyerOrderDetails(buyerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true, imageUrl: true, price: true } } } },
        history: { orderBy: { changedAt: 'asc' } },
      },
    });

    if (!order || order.buyerId !== buyerId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getSellerOrders(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId: userId },
    });

    if (!store) {
      return [];
    }

    return this.prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true, imageUrl: true } } } },
      },
    });
  }

  async processOrder(sellerId: string, orderId: string) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) throw new NotFoundException('Store not found');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, storeId: store.id },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PACKING)
      throw new BadRequestException('Order must be in PACKING status to process');

    const effectiveNow = this.systemConfig.effectiveNow();
    let slaMs = 0;
    if (order.deliveryMethod === 'INSTANT') slaMs = 3 * 3600 * 1000;
    else if (order.deliveryMethod === 'NEXT_DAY') slaMs = 24 * 3600 * 1000;
    else if (order.deliveryMethod === 'REGULAR') slaMs = 72 * 3600 * 1000;

    const slaDueAt = new Date(effectiveNow.getTime() + slaMs);

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.WAITING_DRIVER,
        slaDueAt,
        history: {
          create: {
            status: OrderStatus.WAITING_DRIVER,
            note: 'Menunggu Pengirim',
          },
        },
        deliveryJob: {
          create: {
            earnings: Math.floor(order.deliveryFee * 0.8),
          },
        },
      },
    });
  }

  async getBuyerSpending(buyerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId, status: OrderStatus.COMPLETED },
    });
    const totalSpending = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    return { total: totalSpending };
  }

  async getSellerIncome(sellerId: string) {
    const store = await this.prisma.store.findUnique({ where: { sellerId } });
    if (!store) return { total: 0 };

    const orders = await this.prisma.order.findMany({
      where: { storeId: store.id, status: OrderStatus.COMPLETED },
    });
    const totalIncome = orders.reduce(
      (acc, order) => acc + (order.subtotal - order.discountAmount),
      0,
    );
    return { total: totalIncome };
  }
}
