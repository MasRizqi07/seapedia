import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType } from '@prisma/client';

export class CreatePromoDto {
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate: string;
}

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromoDto) {
    return this.prisma.promo.create({
      data: {
        code: dto.code,
        discountType: dto.discountType,
        value: dto.value,
        expiryDate: new Date(dto.expiryDate),
      },
    });
  }

  async findAll() {
    return this.prisma.promo.findMany({
      orderBy: { expiryDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promo.findUnique({
      where: { id },
    });
    if (!promo) throw new NotFoundException('Promo not found');
    return promo;
  }
}
