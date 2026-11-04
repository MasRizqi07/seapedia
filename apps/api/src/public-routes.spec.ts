import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth/auth.controller';
import { ProductsController } from './products/products.controller';
import { ReviewsController } from './reviews/reviews.controller';
import { StoresController } from './stores/stores.controller';
import { AuthService } from './auth/auth.service';
import { ProductsService } from './products/products.service';
import { ReviewsService } from './reviews/reviews.service';
import { StoresService } from './stores/stores.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { App } from 'supertest/types';

describe('Public Routes E2E Test', () => {
  let app: INestApplication<App>;
  let authService: jest.Mocked<Partial<AuthService>>;
  let productsService: jest.Mocked<Partial<ProductsService>>;
  let reviewsService: jest.Mocked<Partial<ReviewsService>>;
  let storesService: jest.Mocked<Partial<StoresService>>;

  beforeAll(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ id: 'u1' }),
      login: jest.fn().mockResolvedValue({ accessToken: 'test' }),
    };
    productsService = {
      findAllPublic: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    reviewsService = {
      create: jest.fn().mockResolvedValue({ id: 'r1' }),
      findAll: jest.fn().mockResolvedValue([]),
    };
    storesService = {
      getStoreById: jest.fn().mockResolvedValue({ id: 's1' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, ProductsController, ReviewsController, StoresController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ProductsService, useValue: productsService },
        { provide: ReviewsService, useValue: reviewsService },
        { provide: StoresService, useValue: storesService },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        Reflector,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products should return 200 without token', async () => {
    const res = await request(app.getHttpServer()).get('/products');
    if (res.status !== 200) {
      console.log('STATUS:', res.status);
      console.log('BODY:', res.text);
      throw new Error('Test failed: ' + res.text);
    }
    expect(res.status).toBe(200);
  });
  it('GET /products/123 should return 200 without token', async () => {
    await request(app.getHttpServer()).get('/products/123').expect(200);
  });

  it('POST /auth/register should return 201 without token', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({}).expect(201);
  });

  it('POST /auth/login should return 200 without token', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({}).expect(200);
  });

  it('GET /stores/123 should return 200 without token', async () => {
    await request(app.getHttpServer()).get('/stores/123').expect(200);
  });

  it('GET /reviews should return 200 without token', async () => {
    await request(app.getHttpServer()).get('/reviews').expect(200);
  });

  it('POST /reviews should return 201 without token', async () => {
    await request(app.getHttpServer()).post('/reviews').send({}).expect(201);
  });
});
