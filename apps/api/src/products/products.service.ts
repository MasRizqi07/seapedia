import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve the seller's store. Throws if the seller has no store.
   */
  private async resolveStore(sellerId: string) {
    const store = await this.prisma.store.findUnique({
      where: { sellerId },
    });

    if (!store) {
      throw new ForbiddenException('You must create a store before adding products');
    }

    return store;
  }

  /**
   * Verify the product belongs to the seller's store.
   */
  private async verifyOwnership(sellerId: string, productId: string) {
    const store = await this.resolveStore(sellerId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.storeId !== store.id) {
      throw new ForbiddenException('You do not own this product');
    }

    return { store, product };
  }

  /**
   * Create a product under the seller's store.
   */
  async create(sellerId: string, dto: CreateProductDto) {
    const store = await this.resolveStore(sellerId);

    const name = sanitizeHtml(dto.name, { allowedTags: [] });
    const description = sanitizeHtml(dto.description, { allowedTags: [] });

    return this.prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description,
        price: dto.price,
        stock: dto.stock,
        imageUrl: dto.imageUrl || null,
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Get all products for the seller's store.
   */
  async findMyProducts(sellerId: string) {
    const store = await this.resolveStore(sellerId);

    return this.prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Public: paginated product listing with search and sort.
   */
  async findAllPublic(query: ProductQueryDto) {
    const { page = 1, limit = 12, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          store: { select: { id: true, name: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Public: get a single product with store info.
   */
  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Seller updates their own product.
   */
  async update(sellerId: string, productId: string, dto: UpdateProductDto) {
    await this.verifyOwnership(sellerId, productId);

    const data: any = { ...dto };
    if (data.name) data.name = sanitizeHtml(data.name, { allowedTags: [] });
    if (data.description) data.description = sanitizeHtml(data.description, { allowedTags: [] });

    return this.prisma.product.update({
      where: { id: productId },
      data,
      include: {
        store: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Seller deletes their own product.
   */
  async remove(sellerId: string, productId: string) {
    await this.verifyOwnership(sellerId, productId);

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product deleted' };
  }
}
