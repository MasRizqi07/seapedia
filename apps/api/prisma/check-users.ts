import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRawUnsafe('SELECT usename, usesuper FROM pg_user');
  console.log('Database users:');
  console.log(users);
  
  const currentRole = await prisma.$queryRawUnsafe('SELECT current_user, session_user');
  console.log('Current user roles:');
  console.log(currentRole);
}

main().catch(console.error).finally(() => prisma.$disconnect());
