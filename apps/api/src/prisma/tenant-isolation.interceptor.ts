import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from './tenant-context';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return new Observable((subscriber) => {
      const runWithContext = (id?: string) => {
        tenantContext.run({ storeId: id, userId: user?.userId, role: user?.activeRole }, () => {
          const subscription = next.handle().subscribe({
            next: (val) => subscriber.next(val),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
          return () => subscription.unsubscribe();
        });
      };

      if (user) {
        // Authenticated request: Resolve storeId server-side from user metadata, ignore client inputs
        if (user.roles?.includes('SELLER') || user.activeRole === 'SELLER') {
          this.prisma.store
            .findUnique({
              where: { sellerId: user.userId },
            })
            .then((store) => {
              runWithContext(store?.id);
            })
            .catch(() => {
              runWithContext(undefined);
            });
          return;
        }
        // BUYER, DRIVER, ADMIN: No store-scoping needed for their own context
        runWithContext(undefined);
      } else {
        // Unauthenticated request (e.g. public routes): Can fall back to client-supplied storeId
        const headerStoreId = request.headers['x-store-id'] || request.headers['x-tenant-id'];
        const queryStoreId = request.query?.storeId;
        const bodyStoreId =
          request.body && typeof request.body === 'object'
            ? (request.body as Record<string, unknown>).storeId
            : undefined;
        const rawStoreId = headerStoreId || queryStoreId || bodyStoreId;
        const storeId = typeof rawStoreId === 'string' ? rawStoreId : undefined;
        runWithContext(storeId);
      }
    });
  }
}
