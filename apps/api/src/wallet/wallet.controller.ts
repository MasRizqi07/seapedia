import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TopUpDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@ApiBearerAuth('access-token')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get buyer wallet balance' })
  getWallet(@CurrentUser('userId') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Simulate a wallet top-up' })
  topup(@CurrentUser('userId') userId: string, @Body() dto: TopUpDto) {
    return this.walletService.topup(userId, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  getTransactions(@CurrentUser('userId') userId: string) {
    return this.walletService.getTransactions(userId);
  }
}
