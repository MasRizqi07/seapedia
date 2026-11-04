import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a store for the authenticated seller.
   * A seller can only own ONE store (enforced by @unique on sellerId).
   */
  async create(sellerId: string, dto: CreateStoreDto) {
    // Check if seller already has a store
    const existing = await this.prisma.store.findUnique({
      where: { sellerId },
    });

    if (existing) {
      throw new ConflictException('You already have a store. Use update instead.');
    }

    const name = sanitizeHtml(dto.name, { allowedTags: [] });

    // Check if store name is taken
    const nameTaken = await this.prisma.store.findUnique({
      where: { name },
    });

    if (nameTaken) {
      throw new ConflictException(
        'A store with that name already exists. Please choose a different name.',
      );
    }

    return this.prisma.store.create({
      data: {
        sellerId,
        name,
      },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Update the authenticated seller's store.
   */
  async update(sellerId: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) {
      throw new NotFoundException('You have not created a store yet');
    }

    // Sanitize name if provided
    let newName = dto.name;
    if (newName) {
      newName = sanitizeHtml(newName, { allowedTags: [] });
    }

    // Check name uniqueness if changing it
    if (newName && newName !== store.name) {
      const nameTaken = await this.prisma.store.findUnique({
        where: { name: newName },
      });

      if (nameTaken) {
        throw new ConflictException(
          'A store with that name already exists. Please choose a different name.',
        );
      }
    }

    const data: any = { ...dto };
    if (newName) data.name = newName;

    return this.prisma.store.update({
      where: { id: store.id },
      data,
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Create or update the seller's store (upsert pattern for POST /seller/store).
   */
  async createOrUpdate(sellerId: string, dto: CreateStoreDto) {
    const existing = await this.prisma.store.findUnique({
      where: { sellerId },
    });

    if (existing) {
      return this.update(sellerId, dto);
    }

    return this.create(sellerId, dto);
  }

  /**
   * Get the authenticated seller's own store.
   */
  async getMyStore(sellerId: string) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId },
      include: {
        _count: { select: { products: true } },
      },
    });

    return store || null;
  }

  /**
   * Get a store by ID (public endpoint for catalog).
   */
  async getStoreById(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        _count: { select: { products: true } },
        products: {
          take: 12,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }
}
