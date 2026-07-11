import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PromosService, CreatePromoDto } from './promos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/promos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPromoDto: CreatePromoDto) {
    return this.promosService.create(createPromoDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.promosService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.promosService.findOne(id);
  }
}
