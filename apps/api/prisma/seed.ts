import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Define Demo Users
  const users = [
    {
      email: 'admin@seapedia.com',
      username: 'admin',
      name: 'Admin Seapedia',
      passwordHash,
      roles: { create: [{ role: Role.ADMIN }, { role: Role.BUYER }] }
    },
    {
      email: 'seller@seapedia.com',
      username: 'seller',
      name: 'Demo Seller',
      passwordHash,
      roles: { create: [{ role: Role.SELLER }, { role: Role.BUYER }] }
    },
    {
      email: 'buyer@seapedia.com',
      username: 'buyer',
      name: 'Demo Buyer',
      passwordHash,
      roles: { create: [{ role: Role.BUYER }] }
    },
    {
      email: 'driver@seapedia.com',
      username: 'driver',
      name: 'Demo Driver',
      passwordHash,
      roles: { create: [{ role: Role.DRIVER }, { role: Role.BUYER }] }
    }
  ];

  for (const userData of users) {
    const exists = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!exists) {
      await prisma.user.create({ data: userData });
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
