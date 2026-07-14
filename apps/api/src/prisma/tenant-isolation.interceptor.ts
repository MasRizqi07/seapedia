import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from './tenant-context';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Determine storeId (tenantId)
    // 1. Check header x-store-id or x-tenant-id or storeId parameter
    const storeId =
      request.headers['x-store-id'] ||
      request.headers['x-tenant-id'] ||
      request.query['storeId'] ||
      request.body['storeId'];

    return new Observable((subscriber) => {
      const runWithContext = (id?: string) => {
        tenantContext.run(
          { storeId: id, userId: user?.userId, role: user?.activeRole },
          () => {
            const subscription = next.handle().subscribe({
              next: (val) => subscriber.next(val),
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
            return () => subscription.unsubscribe();
          },
        );
      };

      if (!storeId && user) {
        // If it's a seller, resolve their store ID
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
      }

      runWithContext(storeId);
    });
  }
}
