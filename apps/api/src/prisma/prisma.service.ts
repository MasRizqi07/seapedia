import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from './tenant-context';

type DynamicModelDelegate = Record<string, (args: unknown) => Promise<unknown>>;
type DynamicTxClient = Record<string, DynamicModelDelegate>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    const extended = this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            const context = tenantContext.getStore();
            if (!context || !context.storeId) {
              return query(args);
            }

            return this.$transaction(async (tx) => {
              await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${context.storeId}, true)`;
              const delegate = (tx as unknown as DynamicTxClient)[model];
              if (delegate && typeof delegate[operation] === 'function') {
                return delegate[operation](args);
              }
              return query(args);
            });
          },
        },
      },
    });

    Object.assign(extended, {
      onModuleInit: async () => {
        await this.$connect();
      },
      onModuleDestroy: async () => {
        await this.$disconnect();
      },
    });

    return extended as unknown as this;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
}
