import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            checkout: jest.fn().mockResolvedValue({ id: 'order-1', status: 'PACKING' }),
            getBuyerOrders: jest.fn().mockResolvedValue([]),
            getSellerOrders: jest.fn().mockResolvedValue([]),
            processOrder: jest.fn().mockResolvedValue({ id: 'order-1', status: 'SHIPPING' }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should checkout order happy path', async () => {
    const dto = { deliveryMethod: 'REGULAR' as any, addressId: 'address-1' };
    const result = await controller.checkout('user-1', dto);
    expect(service.checkout).toHaveBeenCalledWith('user-1', dto);
    expect(result).toEqual({ id: 'order-1', status: 'PACKING' });
  });
});
