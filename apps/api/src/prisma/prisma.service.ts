import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from './tenant-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    const self = this;

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const context = tenantContext.getStore();
            if (!context || !context.storeId) {
              return query(args);
            }

            return self.$transaction(async (tx) => {
              await tx.$executeRawUnsafe(
                `SELECT set_config('app.current_tenant_id', $1, true)`,
                context.storeId,
              );
              // @ts-ignore
              return tx[model][operation](args);
            });
          },
        },
      },
    });

    (extended as any).onModuleInit = async () => {
      await self.$connect();
    };

    (extended as any).onModuleDestroy = async () => {
      await self.$disconnect();
    };

    return extended as unknown as this;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
}
