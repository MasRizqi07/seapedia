import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Post('simulate-next-day')
  simulateNextDay() {
    return this.adminService.simulateNextDay();
  }

  @Post('run-overdue-check')
  runOverdueCheck() {
    return this.adminService.runOverdueCheck();
  }

  @Get('orders/overdue')
  getOverdueOrders() {
    return this.adminService.getOverdueOrders();
  }
}
