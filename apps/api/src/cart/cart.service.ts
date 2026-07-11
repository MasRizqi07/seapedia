import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(buyerId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: {
              include: { store: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { buyerId },
        include: {
          items: {
            include: {
              product: {
                include: { store: true },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

    return { ...cart, subtotal };
  }

  async addItem(buyerId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { buyerId },
        include: { items: true },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { buyerId },
          include: { items: true },
        });
      }

      // Single-store validation
      if (cart.storeId && cart.storeId !== product.storeId) {
        throw new ConflictException(
          `Your cart contains items from another store. You can only checkout from one store at a time. Clear cart to switch stores.`,
        );
      }

      // If this is the first item, lock the cart to this store
      if (!cart.storeId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { storeId: product.storeId },
        });
      }

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
      });

      if (existingItem) {
        await tx.cartItem.update({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: product.id,
            },
          },
          data: { quantity: existingItem.quantity + dto.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: dto.quantity,
          },
        });
      }

      return this.getCart(buyerId);
    });
  }

  async updateItemQuantity(buyerId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { buyerId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity: dto.quantity },
    });

    return this.getCart(buyerId);
  }

  async removeItem(buyerId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { buyerId },
      include: { items: true },
    });

    if (!cart) return;

    await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // Check if cart is now empty, if so, unlock storeId
    const remainingItems = await this.prisma.cartItem.count({
      where: { cartId: cart.id },
    });

    if (remainingItems === 0) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { storeId: null },
      });
    }

    return this.getCart(buyerId);
  }

  async clearCart(buyerId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { buyerId },
    });

    if (!cart) return;

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      }),
      this.prisma.cart.update({
        where: { id: cart.id },
        data: { storeId: null },
      }),
    ]);

    return this.getCart(buyerId);
  }
}
