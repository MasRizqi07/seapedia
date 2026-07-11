import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Determine the activeRole based on the rules.
   * "If the user owns more than one non-admin role, the token has activeRole set to null."
   */
  private determineInitialActiveRole(roles: Role[]): Role | null {
    const nonAdminRoles = roles.filter((r) => r !== Role.ADMIN);
    if (nonAdminRoles.length > 1) {
      return null; // Must select explicitly
    }
    if (nonAdminRoles.length === 1) {
      return nonAdminRoles[0];
    }
    if (roles.includes(Role.ADMIN)) {
      return Role.ADMIN;
    }
    return null;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Cannot register as ADMIN through public endpoint');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          username: dto.email, // using email as username fallback for now
          passwordHash: hashedPassword,
          phone: dto.phone || null,
        },
      });

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          role: dto.role,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: createdUser.id },
        include: { roles: true },
      });
    });

    const flatRoles = user.roles.map((ur) => ur.role);
    const activeRole = this.determineInitialActiveRole(flatRoles);

    const tokens = await this.generateTokens(user.id, user.username, flatRoles, activeRole);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const flatRoles = user.roles.map((ur) => ur.role);
    const activeRole = this.determineInitialActiveRole(flatRoles);

    const tokens = await this.generateTokens(user.id, user.username, flatRoles, activeRole);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async selectRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const flatRoles = user.roles.map((ur) => ur.role);
    if (!flatRoles.includes(role)) {
      throw new ForbiddenException(`You do not own the role: ${role}`);
    }

    const tokens = await this.generateTokens(user.id, user.username, flatRoles, role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new ForbiddenException('Access denied');
    }

    // Attempt to parse the old JWT to preserve activeRole if possible
    // (In a real app we might pass activeRole from the refresh token, 
    // but the refresh token only has sub). Let's re-run the default determination.
    const flatRoles = user.roles.map((ur) => ur.role);
    const activeRole = this.determineInitialActiveRole(flatRoles);

    const tokens = await this.generateTokens(user.id, user.username, flatRoles, activeRole);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, username: string, roles: Role[], activeRole: Role | null) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, username, roles, activeRole },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  private sanitizeUser(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, roles, ...sanitized } = user;
    return {
      ...sanitized,
      roles: roles?.map((ur: any) => ur.role) || [],
    };
  }
}
