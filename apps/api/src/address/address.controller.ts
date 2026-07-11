import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Address')
@Controller('address')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@ApiBearerAuth('access-token')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new delivery address' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for buyer' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.addressService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address' })
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addressService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addressService.remove(userId, id);
  }
}
