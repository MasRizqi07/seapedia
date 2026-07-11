import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the current user (or a specific field) from the request.
 *
 * Usage:
 *   @CurrentUser()           → returns full { userId, email, roles }
 *   @CurrentUser('userId')   → returns just the userId string
 *
 * This is the ONLY way to get the user's identity in controllers.
 * Never accept userId/buyerId/sellerId from the request body.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user?.[data];
    }
    return request.user;
  },
);
