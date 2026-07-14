import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

import { Reflector } from '@nestjs/core';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new JwtAuthGuard(mockReflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should reject unauthenticated requests', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    // The AuthGuard('jwt') relies on passport under the hood.
    // If we call handleRequest with no user, it should throw UnauthorizedException
    expect(() => guard.handleRequest(null, null, new Error('No auth token'), mockContext)).toThrow(UnauthorizedException);
  });
});
