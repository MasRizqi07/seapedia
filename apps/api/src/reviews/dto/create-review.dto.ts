import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'Alice', description: 'Name of the reviewer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reviewerName: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great marketplace!',
    description: 'Review comment. HTML will be sanitized.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;
}
