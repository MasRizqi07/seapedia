import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * RolesGuard enforces role-based access control.
 *
 * How it works:
 * 1. Reads required roles from @Roles() decorator metadata
 * 2. Gets the activeRole from the verified JWT payload (req.user)
 * 3. Verifies the active role is not null
 * 4. Verifies the active role is one of the required roles
 *
 * The JWT is the single source of truth. The client must call
 * POST /auth/select-role to get a token with activeRole if they
 * have multiple roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // Read active role from JWT
    const activeRole = user.activeRole;

    if (!activeRole) {
      throw new ForbiddenException('Please select an active role first (POST /auth/select-role)');
    }

    // Verify active role is one of the roles allowed for this endpoint
    if (!requiredRoles.includes(activeRole as Role)) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
