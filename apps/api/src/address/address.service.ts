import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateAddressDto) {
    const addresses = await this.prisma.address.findMany({ where: { buyerId } });
    
    // First address is always default
    const isFirst = addresses.length === 0;
    const isDefault = isFirst || dto.isDefault;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault && !isFirst) {
        await tx.address.updateMany({
          where: { buyerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          buyerId,
          ...dto,
          isDefault,
        },
      });
    });
  }

  async findAll(buyerId: string) {
    return this.prisma.address.findMany({
      where: { buyerId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findOne(buyerId: string, id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.buyerId !== buyerId) {
      throw new ForbiddenException('Not your address');
    }

    return address;
  }

  async update(buyerId: string, id: string, dto: UpdateAddressDto) {
    await this.findOne(buyerId, id); // Ensure ownership

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { buyerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(buyerId: string, id: string) {
    const address = await this.findOne(buyerId, id); // Ensure ownership

    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      // If we deleted the default address, make another one default
      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { buyerId },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { message: 'Address deleted' };
  }
}
