import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType } from '@prisma/client';

export class CreateVoucherDto {
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate: string;
  usageLimit: number;
}

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVoucherDto) {
    return this.prisma.voucher.create({
      data: {
        code: dto.code,
        discountType: dto.discountType,
        value: dto.value,
        expiryDate: new Date(dto.expiryDate),
        usageLimit: dto.usageLimit,
      },
    });
  }

  async findAll() {
    return this.prisma.voucher.findMany({
      orderBy: { expiryDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
    });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }
}
