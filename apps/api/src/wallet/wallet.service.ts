import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopUpDto } from './dto/wallet.dto';
import { WalletTxType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(buyerId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { buyerId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { buyerId, balance: 0 },
      });
    }

    return wallet;
  }

  async topup(buyerId: string, dto: TopUpDto) {
    // Top-up simulation: Increment balance and log transaction atomically
    const result = await this.prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { buyerId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { buyerId, balance: 0 },
        });
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: dto.amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          type: WalletTxType.TOPUP,
          amount: dto.amount,
        },
      });

      return updatedWallet;
    });

    return result;
  }

  async getTransactions(buyerId: string) {
    const wallet = await this.getWallet(buyerId);

    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
