import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, roles, ...profile } = user;
    return {
      ...profile,
      roles: roles?.map((ur) => ur.role) || [],
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { roles: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, roles, ...profile } = user;
    return {
      ...profile,
      roles: roles?.map((ur) => ur.role) || [],
    };
  }
}
