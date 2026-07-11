import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ example: 'clq123...', description: 'Product ID to add' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'New quantity' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
