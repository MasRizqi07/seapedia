import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://app_runtime_test:password@localhost:5433/seapedia?schema=public"
    }
  }
});

async function main() {
  console.log('Testing RLS bypass with row_security = off...');
  
  // Set row_security = off in transaction and query orders
  const ordersBypass = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET row_security = off`);
    return tx.order.findMany();
  });
  console.log('Orders with row_security = off:');
  console.log(ordersBypass);
}

main().catch(console.error).finally(() => prisma.$disconnect());
