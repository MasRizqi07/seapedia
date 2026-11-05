process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'change-me-to-a-random-string-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'change-me-to-a-different-random-string-at-least-32-chars';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { DeliveryMethod, DiscountType, Role } from '@prisma/client';
import { App } from 'supertest/types';

describe('Seapedia Full-Cycle Business Rules E2E (apps/api/test)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authService: AuthService;

  let buyerToken: string;
  let buyerId: string;
  let sellerId: string;

  let storeAId: string;
  let storeBId: string;
  let productAId: string;
  let productBId: string;
  let buyerAddressId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    authService = app.get(AuthService);

    // 1. Authenticate Buyer
    const buyerAuth = await authService.login({
      email: 'buyer@seapedia.com',
      password: 'password123',
    });
    buyerToken = buyerAuth.accessToken;
    buyerId = buyerAuth.user.id;

    // 2. Authenticate Seller with activeRole SELLER
    const sellerLogin = await authService.login({
      email: 'seller@seapedia.com',
      password: 'password123',
    });
    await authService.selectRole(String(sellerLogin.user.id), Role.SELLER);
    sellerId = String(sellerLogin.user.id);

    // 3. Authenticate Driver with activeRole DRIVER
    const driverLogin = await authService.login({
      email: 'driver@seapedia.com',
      password: 'password123',
    });
    await authService.selectRole(String(driverLogin.user.id), Role.DRIVER);

    // 4. Authenticate Admin with activeRole ADMIN
    const adminLogin = await authService.login({
      email: 'admin@seapedia.com',
      password: 'password123',
    });
    await authService.selectRole(String(adminLogin.user.id), Role.ADMIN);

    // Ensure Seller Store A exists
    let storeA = await prisma.store.findUnique({ where: { sellerId } });
    if (!storeA) {
      storeA = await prisma.store.create({
        data: {
          sellerId,
          name: 'Store A Seafood E2E',
        },
      });
    }
    storeAId = storeA.id;

    // Ensure Store B exists
    let storeB = await prisma.store.findFirst({ where: { name: 'Store B Isolated E2E' } });
    if (!storeB) {
      let sellerB = await prisma.user.findUnique({ where: { email: 'seller_b_e2e@seapedia.com' } });
      if (!sellerB) {
        sellerB = await prisma.user.create({
          data: {
            email: 'seller_b_e2e@seapedia.com',
            username: 'seller_b_e2e',
            name: 'Seller B E2E',
            passwordHash: 'dummy',
            roles: { create: [{ role: Role.SELLER }] },
          },
        });
      }
      storeB = await prisma.store.create({
        data: {
          sellerId: sellerB.id,
          name: 'Store B Isolated E2E',
        },
      });
    }
    storeBId = storeB.id;

    // Create Test Product A in Store A
    const productA = await prisma.product.create({
      data: {
        storeId: storeAId,
        name: 'Udang Vaname E2E',
        description: 'Udang vaname segar',
        price: 50000,
        stock: 20,
      },
    });
    productAId = productA.id;

    // Create Test Product B in Store B
    const productB = await prisma.product.create({
      data: {
        storeId: storeBId,
        name: 'Kepiting Bakau E2E',
        description: 'Kepiting bakau pilihan',
        price: 75000,
        stock: 10,
      },
    });
    productBId = productB.id;

    // Ensure Buyer has an address
    let address = await prisma.address.findFirst({ where: { buyerId } });
    if (!address) {
      address = await prisma.address.create({
        data: {
          buyerId,
          label: 'Kantor',
          recipientName: 'Demo Buyer',
          phone: '081234567890',
          fullAddress: 'Jl. Bahari No. 12 Jakarta',
        },
      });
    }
    buyerAddressId = address.id;
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      if (productAId) {
        await prisma.cartItem.deleteMany({ where: { productId: productAId } });
        await prisma.orderItem.deleteMany({ where: { productId: productAId } });
        await prisma.product.delete({ where: { id: productAId } }).catch(() => null);
      }
      if (productBId) {
        await prisma.cartItem.deleteMany({ where: { productId: productBId } });
        await prisma.orderItem.deleteMany({ where: { productId: productBId } });
        await prisma.product.delete({ where: { id: productBId } }).catch(() => null);
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('Full-Cycle E2E Validation', () => {
    it('1. should strip XSS scripts in public reviews', async () => {
      const res = await request(app.getHttpServer()).post('/api/reviews').send({
        reviewerName: 'SecTest',
        rating: 5,
        comment: '<script>alert(1)</script>Gurih dan Mantap',
      });
      expect(res.status).toBe(201);
      expect(res.body.comment).toBe('Gurih dan Mantap');
    });

    it('2. should enforce single-store cart with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .delete('/api/cart')
        .set('Authorization', `Bearer ${buyerToken}`);
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 2 });

      const res = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productBId, quantity: 1 });

      expect(res.status).toBe(409);
    });

    it('3. should checkout with voucher & exact 11% PPN calculation', async () => {
      await request(app.getHttpServer())
        .post('/api/wallet/topup')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ amount: 500000 });

      const voucherCode = `E2EDISC-${Date.now()}`;
      await prisma.voucher.create({
        data: {
          code: voucherCode,
          discountType: DiscountType.PERCENT,
          value: 10,
          usageLimit: 5,
          expiryDate: new Date(Date.now() + 86400000),
        },
      });

      const expectedTotal = 127650; // (100000 - 10000 + 25000) * 1.11
      const res = await request(app.getHttpServer())
        .post('/api/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          addressId: buyerAddressId,
          deliveryMethod: DeliveryMethod.INSTANT,
          discountCode: voucherCode,
        });

      expect(res.status).toBe(201);
      expect(res.body.totalAmount).toBe(expectedTotal);
    });

    it('4. should verify deep healthcheck endpoint /api/health', async () => {
      const res = await request(app.getHttpServer()).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('up');
      expect(['up', 'degraded']).toContain(res.body.redis);
    });
  });
});
