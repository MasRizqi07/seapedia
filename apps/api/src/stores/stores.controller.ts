import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Stores')
@Controller()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post('seller/store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create or update store (seller only)' })
  @ApiResponse({ status: 201, description: 'Store created/updated' })
  @ApiResponse({ status: 409, description: 'Store name taken' })
  async createOrUpdate(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.createOrUpdate(userId, dto);
  }

  @Get('seller/store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get seller's own store" })
  @ApiResponse({ status: 200, description: 'Store found' })
  async getMyStore(@CurrentUser('userId') userId: string) {
    // Returns null if no store yet
    return this.storesService.getMyStore(userId);
  }

  @Get('stores/:id')
  @Public()
  @ApiOperation({ summary: 'Get store by ID (public)' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getStoreById(@Param('id') id: string) {
    return this.storesService.getStoreById(id);
  }
}
