import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TenantIsolationInterceptor } from './tenant-isolation.interceptor';
import { PrismaService } from './prisma.service';
import { tenantContext } from './tenant-context';

describe('TenantIsolationInterceptor', () => {
  let interceptor: TenantIsolationInterceptor;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      store: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantIsolationInterceptor, { provide: PrismaService, useValue: prismaService }],
    }).compile();

    interceptor = module.get<TenantIsolationInterceptor>(TenantIsolationInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should ignore x-store-id header and query DB for storeId if user is a SELLER', (done) => {
    const mockRequest = {
      user: {
        userId: 'seller-user-123',
        roles: ['SELLER'],
        activeRole: 'SELLER',
      },
      headers: {
        'x-store-id': 'spoofed-store-456',
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    prismaService.store.findUnique.mockResolvedValue({ id: 'actual-store-123' });

    const mockCallHandler: CallHandler = {
      handle: () => {
        // Assert that the context contains the actual store ID, not the spoofed header
        const context = tenantContext.getStore();
        expect(context).toBeDefined();
        expect(context?.storeId).toBe('actual-store-123');
        expect(context?.userId).toBe('seller-user-123');
        expect(context?.role).toBe('SELLER');
        return of('test-response');
      },
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('test-response');
        expect(prismaService.store.findUnique).toHaveBeenCalledWith({
          where: { sellerId: 'seller-user-123' },
        });
        done();
      },
      error: done,
    });
  });

  it('should set storeId to undefined and ignore x-store-id if user is a BUYER', (done) => {
    const mockRequest = {
      user: {
        userId: 'buyer-user-123',
        roles: ['BUYER'],
        activeRole: 'BUYER',
      },
      headers: {
        'x-store-id': 'some-store-789',
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => {
        const context = tenantContext.getStore();
        expect(context).toBeDefined();
        expect(context?.storeId).toBeUndefined();
        return of('test-response');
      },
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('test-response');
        expect(prismaService.store.findUnique).not.toHaveBeenCalled();
        done();
      },
      error: done,
    });
  });

  it('should use client-supplied x-store-id if request is unauthenticated', (done) => {
    const mockRequest = {
      user: undefined,
      headers: {
        'x-store-id': 'public-store-999',
      },
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => {
        const context = tenantContext.getStore();
        expect(context).toBeDefined();
        expect(context?.storeId).toBe('public-store-999');
        return of('test-response');
      },
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('test-response');
        expect(prismaService.store.findUnique).not.toHaveBeenCalled();
        done();
      },
      error: done,
    });
  });
});
