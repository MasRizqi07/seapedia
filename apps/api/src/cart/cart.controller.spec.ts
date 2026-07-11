import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn().mockResolvedValue({ id: 'cart-1', items: [] }),
            addItem: jest.fn().mockResolvedValue({ success: true }),
            updateItemQuantity: jest.fn().mockResolvedValue({ success: true }),
            removeItem: jest.fn().mockResolvedValue({ success: true }),
            clearCart: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a cart happy path', async () => {
    const result = await controller.getCart('user-1');
    expect(service.getCart).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'cart-1', items: [] });
  });
});
