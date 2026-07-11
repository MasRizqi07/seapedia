import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Atlantic Salmon', description: 'Product name (3-200 chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Premium wild-caught salmon, perfect for sushi and grilling.', description: '10-2000 chars' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 150000, description: 'Price in IDR (min 1000)' })
  @IsInt()
  @Min(1000)
  price: number;

  @ApiProperty({ example: 50, description: 'Stock quantity (min 0)' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'https://images.example.com/salmon.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
