import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TenantIsolationInterceptor } from './prisma/tenant-isolation.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { tenantContext } from './prisma/tenant-context';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { App } from 'supertest/types';

describe('Tenant Isolation Integration Test', () => {
  let app: INestApplication<App>;
  let prismaService: any;
  let ordersService: any;
  let mockUser: any = null;

  beforeAll(async () => {
    prismaService = {
      store: {
        findUnique: jest.fn(),
      },
      order: {
        findMany: jest.fn().mockImplementation(() => {
          // Verify current tenant context inside the prisma call
          const context = tenantContext.getStore();
          return Promise.resolve([
            { id: 'order-1', storeId: context?.storeId }
          ]);
        }),
      },
    };

    ordersService = new OrdersService(prismaService as any, { effectiveNow: () => new Date() } as any);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: PrismaService, useValue: prismaService },
        { provide: APP_INTERCEPTOR, useClass: TenantIsolationInterceptor },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should ignore client-supplied x-store-id header and use DB-resolved store for SELLER', async () => {
    mockUser = {
      userId: 'seller-a-id',
      roles: ['SELLER'],
      activeRole: 'SELLER',
    };

    prismaService.store.findUnique.mockResolvedValue({ id: 'store-a-id' });

    const response = await request(app.getHttpServer())
      .get('/seller/orders')
      .set('x-store-id', 'spoofed-store-b-id')
      .expect(200);

    expect(response.body).toEqual([
      { id: 'order-1', storeId: 'store-a-id' }
    ]);
    expect(prismaService.store.findUnique).toHaveBeenCalledWith({
      where: { sellerId: 'seller-a-id' },
    });
  });
});
