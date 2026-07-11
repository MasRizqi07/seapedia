import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryMethod } from '@prisma/client';

export class CheckoutDto {
  @ApiProperty({ example: 'clq123...', description: 'Selected delivery address ID' })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({ enum: DeliveryMethod, example: DeliveryMethod.REGULAR })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiProperty({ example: 'SUMMER2024', required: false })
  @IsString()
  @IsOptional()
  discountCode?: string;
}
