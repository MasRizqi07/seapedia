import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('seller/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a product (seller only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@CurrentUser('userId') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Get('seller/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get seller's own products" })
  @ApiResponse({ status: 200, description: 'Products list' })
  async findMyProducts(@CurrentUser('userId') userId: string) {
    return this.productsService.findMyProducts(userId);
  }

  @Patch('seller/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a product (seller only, own product)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 403, description: 'Not your product' })
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(userId, id, dto);
  }

  @Delete('seller/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a product (seller only, own product)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 403, description: 'Not your product' })
  async remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.productsService.remove(userId, id);
  }

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'List all products (public, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAllPublic(query);
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID (public)' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
