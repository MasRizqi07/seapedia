import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import { SystemConfigModule } from '../system-config/system-config.module';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ProductsModule, SystemConfigModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
