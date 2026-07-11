import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({
    example: 'Ocean Fresh Market',
    description: 'Store name (3-100 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}

export class UpdateStoreDto {
  @ApiPropertyOptional({
    example: 'Ocean Fresh Market Updated',
    description: 'Store name (3-100 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;
}
