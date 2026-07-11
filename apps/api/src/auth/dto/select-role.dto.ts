import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SelectRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.SELLER,
    description: 'The role you want to switch to for the new session',
  })
  @IsEnum(Role)
  role: Role;
}
