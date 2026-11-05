process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'change-me-to-a-random-string-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'change-me-to-a-different-random-string-at-least-32-chars';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { DeliveryMethod, DiscountType, OrderStatus, Role } from '@prisma/client';
import { App } from 'supertest/types';

describe('Seapedia Full-Cycle Business Rules E2E Test Suite (Level 7)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authService: AuthService;

  let buyerToken: string;
  let buyerId: string;
  let sellerToken: string;
  let sellerId: string;
  let driverToken: string;
  let driverId: string;
  let adminToken: string;

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
    const sellerRole = await authService.selectRole(String(sellerLogin.user.id), Role.SELLER);
    sellerToken = sellerRole.accessToken;
    sellerId = String(sellerLogin.user.id);

    // 3. Authenticate Driver with activeRole DRIVER
    const driverLogin = await authService.login({
      email: 'driver@seapedia.com',
      password: 'password123',
    });
    const driverRole = await authService.selectRole(String(driverLogin.user.id), Role.DRIVER);
    driverToken = driverRole.accessToken;
    driverId = String(driverLogin.user.id);

    // Ensure driver has no leftover active jobs
    await prisma.deliveryJob.updateMany({
      where: { driverId, status: 'TAKEN' },
      data: { status: 'COMPLETED' },
    });

    // 4. Authenticate Admin with activeRole ADMIN
    const adminLogin = await authService.login({
      email: 'admin@seapedia.com',
      password: 'password123',
    });
    const adminRole = await authService.selectRole(String(adminLogin.user.id), Role.ADMIN);
    adminToken = adminRole.accessToken;

    // Ensure Seller Store A exists
    let storeA = await prisma.store.findUnique({ where: { sellerId } });
    if (!storeA) {
      storeA = await prisma.store.create({
        data: {
          sellerId,
          name: 'Store A Seafood',
        },
      });
    }
    storeAId = storeA.id;

    // Ensure a second store (Store B) exists for single-store checkout validation
    let storeB = await prisma.store.findFirst({ where: { name: 'Store B Isolated' } });
    if (!storeB) {
      let sellerB = await prisma.user.findUnique({ where: { email: 'seller_b@seapedia.com' } });
      if (!sellerB) {
        sellerB = await prisma.user.create({
          data: {
            email: 'seller_b@seapedia.com',
            username: 'seller_b',
            name: 'Seller B',
            passwordHash: 'dummy',
            roles: { create: [{ role: Role.SELLER }] },
          },
        });
      }
      storeB = await prisma.store.create({
        data: {
          sellerId: sellerB.id,
          name: 'Store B Isolated',
        },
      });
    }
    storeBId = storeB.id;

    // Create Test Product A in Store A
    const productA = await prisma.product.create({
      data: {
        storeId: storeAId,
        name: 'Udang Vaname Super Segar',
        description: 'Udang vaname segar langsung dari tambak',
        price: 50000,
        stock: 20,
      },
    });
    productAId = productA.id;

    // Create Test Product B in Store B
    const productB = await prisma.product.create({
      data: {
        storeId: storeBId,
        name: 'Kepiting Bakau Jumbo',
        description: 'Kepiting bakau hidup pilihan',
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
          label: 'Rumah',
          recipientName: 'Demo Buyer',
          phone: '081234567890',
          fullAddress: 'Jl. Bahari No. 10 Jakarta',
        },
      });
    }
    buyerAddressId = address.id;
  }, 30000);

  afterAll(async () => {
    // Clean up created test products
    if (prisma) {
      if (driverId) {
        await prisma.deliveryJob.updateMany({
          where: { driverId, status: 'TAKEN' },
          data: { status: 'COMPLETED' },
        });
      }
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

  // ─────────────────────────────────────────────────────────────
  // 1. XSS SANITIZATION VERIFICATION
  // ─────────────────────────────────────────────────────────────
  describe('Rule 1: XSS Sanitization Verification', () => {
    it('should strip dangerous <script> tags from public reviews', async () => {
      const response = await request(app.getHttpServer()).post('/api/reviews').send({
        reviewerName: 'Security Reviewer',
        rating: 5,
        comment: '<script>alert("XSS-ATTACK")</script>Ikan segar sekali!',
      });

      expect(response.status).toBe(201);
      expect(response.body.comment).toBe('Ikan segar sekali!');
      expect(response.body.comment).not.toContain('<script>');

      // Verify in DB
      const dbReview = await prisma.review.findUnique({
        where: { id: response.body.id },
      });
      expect(dbReview?.comment).toBe('Ikan segar sekali!');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SINGLE-STORE CART ENFORCEMENT
  // ─────────────────────────────────────────────────────────────
  describe('Rule 2: Single-Store Cart Enforcement', () => {
    it('should allow adding item from Store A, but reject adding item from Store B with 409 Conflict', async () => {
      // Clear cart first
      await request(app.getHttpServer())
        .delete('/api/cart')
        .set('Authorization', `Bearer ${buyerToken}`);

      // Add Product A from Store A
      const addRes1 = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 2 });

      expect(addRes1.status).toBe(201);

      // Attempt to add Product B from Store B
      const addRes2 = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productBId, quantity: 1 });

      expect(addRes2.status).toBe(409);
      expect(addRes2.body.message).toContain('another store');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. CHECKOUT, VOUCHER & PPN 11% MATHEMATICAL ACCURACY
  // ─────────────────────────────────────────────────────────────
  let createdOrderId: string;
  const initialStock = 20;
  const purchaseQty = 2;
  const itemPrice = 50000;
  const instantDeliveryFee = 25000;
  const voucherCode = `DISC10-${Date.now()}`;

  describe('Rule 3: Checkout, Voucher & PPN 11% Math Accuracy', () => {
    it('should compute exact Total = (Subtotal - Discount + Delivery) * 1.11 and deduct wallet & stock atomically', async () => {
      // Topup buyer wallet with sufficient funds
      await request(app.getHttpServer())
        .post('/api/wallet/topup')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ amount: 500000 });

      // Fetch wallet balance before checkout
      const walletBefore = await prisma.wallet.findUniqueOrThrow({ where: { buyerId } });

      // Create a 10% discount voucher
      await prisma.voucher.create({
        data: {
          code: voucherCode,
          discountType: DiscountType.PERCENT,
          value: 10,
          usageLimit: 5,
          expiryDate: new Date(Date.now() + 86400000), // 1 day future
        },
      });

      // Mathematical expectation:
      // Subtotal = 2 * 50,000 = 100,000
      // Discount = 10% of 100,000 = 10,000
      // Taxable = 100,000 - 10,000 + 25,000 = 115,000
      // PPN (11%) = Math.floor(115,000 * 0.11) = 12,650
      // Total = 115,000 + 12,650 = 127,650
      const expectedSubtotal = purchaseQty * itemPrice;
      const expectedDiscount = Math.floor(expectedSubtotal * 0.1);
      const expectedTaxable = expectedSubtotal - expectedDiscount + instantDeliveryFee;
      const expectedPpn = Math.floor(expectedTaxable * 0.11);
      const expectedTotal = expectedTaxable + expectedPpn; // 127650

      const checkoutRes = await request(app.getHttpServer())
        .post('/api/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          addressId: buyerAddressId,
          deliveryMethod: DeliveryMethod.INSTANT,
          discountCode: voucherCode,
        });

      expect(checkoutRes.status).toBe(201);
      createdOrderId = checkoutRes.body.id;
      expect(checkoutRes.body.totalAmount).toBe(expectedTotal);
      expect(checkoutRes.body.ppnAmount).toBe(expectedPpn);
      expect(checkoutRes.body.status).toBe(OrderStatus.PACKING);

      // Verify wallet deduction
      const walletAfter = await prisma.wallet.findUniqueOrThrow({ where: { buyerId } });
      expect(walletBefore.balance - walletAfter.balance).toBe(expectedTotal);

      // Verify atomic stock decrement
      const productAfter = await prisma.product.findUniqueOrThrow({ where: { id: productAId } });
      expect(productAfter.stock).toBe(initialStock - purchaseQty);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. SELLER PROCESSING & DRIVER 80% COMMISSION
  // ─────────────────────────────────────────────────────────────
  let deliveryJobId: string;

  describe('Rule 4: Seller Processing & Driver 80% Commission', () => {
    it('should transition order to WAITING_DRIVER and create delivery job with exact 80% commission', async () => {
      // Seller advances order to WAITING_DRIVER
      const processRes = await request(app.getHttpServer())
        .patch(`/api/seller/orders/${createdOrderId}/process`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(processRes.status).toBe(200);
      expect(processRes.body.status).toBe(OrderStatus.WAITING_DRIVER);

      // Verify DeliveryJob created with 80% delivery fee earnings
      const job = await prisma.deliveryJob.findUniqueOrThrow({
        where: { orderId: createdOrderId },
      });
      deliveryJobId = job.id;
      const expectedEarnings = Math.floor(instantDeliveryFee * 0.8); // 20000
      expect(job.earnings).toBe(expectedEarnings);
      expect(job.status).toBe('AVAILABLE');

      // Driver takes the job
      const takeRes = await request(app.getHttpServer())
        .post(`/api/driver/jobs/${deliveryJobId}/take`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(takeRes.status).toBe(201);

      // Verify order status is now SHIPPING
      const orderAfterTake = await prisma.order.findUniqueOrThrow({
        where: { id: createdOrderId },
      });
      expect(orderAfterTake.status).toBe(OrderStatus.SHIPPING);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. TIME SIMULATION & OVERDUE SLA AUTO-REFUND
  // ─────────────────────────────────────────────────────────────
  describe('Rule 5: Time Simulation & Overdue SLA Auto-Refund', () => {
    it('should advance time by 24h, detect SLA breach, transition order to RETURNED, and restore wallet & stock', async () => {
      const walletBeforeRefund = await prisma.wallet.findUniqueOrThrow({ where: { buyerId } });

      // Admin simulates next day (advances clock +24h, exceeding 3h INSTANT SLA)
      const simRes = await request(app.getHttpServer())
        .post('/api/admin/simulate-next-day')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(simRes.status).toBe(201);

      // Admin triggers overdue check sweep
      const sweepRes = await request(app.getHttpServer())
        .post('/api/admin/run-overdue-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(sweepRes.status).toBe(201);

      // Verify order status is RETURNED
      const returnedOrder = await prisma.order.findUniqueOrThrow({
        where: { id: createdOrderId },
      });
      expect(returnedOrder.status).toBe(OrderStatus.RETURNED);

      // Verify 100% full refund returned to Buyer wallet
      const walletAfterRefund = await prisma.wallet.findUniqueOrThrow({ where: { buyerId } });
      expect(walletAfterRefund.balance - walletBeforeRefund.balance).toBe(
        returnedOrder.totalAmount,
      );

      // Verify Seller product stock restored back to initial (20)
      const productRestored = await prisma.product.findUniqueOrThrow({ where: { id: productAId } });
      expect(productRestored.stock).toBe(initialStock);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. DEEP SYSTEM HEALTHCHECK
  // ─────────────────────────────────────────────────────────────
  describe('Rule 6: Deep System Healthcheck', () => {
    it('should return 200 OK with database up and redis status', async () => {
      const res = await request(app.getHttpServer()).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('up');
      expect(['up', 'degraded']).toContain(res.body.redis);
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
