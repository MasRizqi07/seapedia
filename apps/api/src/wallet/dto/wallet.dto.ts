import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopUpDto {
  @ApiProperty({ example: 50000, description: 'Amount to top up' })
  @IsInt()
  @Min(1000)
  @IsNotEmpty()
  amount: number;
}
