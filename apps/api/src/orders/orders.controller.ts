import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Checkout cart (BUYER)' })
  checkout(@CurrentUser('userId') userId: string, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(userId, dto);
  }

  @Get('orders')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Get buyer orders (BUYER)' })
  getBuyerOrders(@CurrentUser('userId') userId: string) {
    return this.ordersService.getBuyerOrders(userId);
  }

  @Get('orders/:id')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Get buyer order details (BUYER)' })
  getBuyerOrderDetails(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.ordersService.getBuyerOrderDetails(userId, id);
  }

  @Get('seller/orders')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get incoming orders (SELLER)' })
  getSellerOrders(@CurrentUser('userId') userId: string) {
    return this.ordersService.getSellerOrders(userId);
  }

  @Patch('seller/orders/:id/process')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Process order (SELLER)' })
  processOrder(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.ordersService.processOrder(userId, id);
  }

  @Get('buyer/reports/spending')
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Get buyer spending report (BUYER)' })
  getBuyerSpending(@CurrentUser('userId') userId: string) {
    return this.ordersService.getBuyerSpending(userId);
  }

  @Get('seller/reports/income')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get seller income report (SELLER)' })
  getSellerIncome(@CurrentUser('userId') userId: string) {
    return this.ordersService.getSellerIncome(userId);
  }
}
