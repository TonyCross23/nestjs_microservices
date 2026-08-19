import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'iPhone 15 Pro', price: 999, stock: 10 },
      { name: 'MacBook Pro M3', price: 1999, stock: 5 },
    ],
  });
  console.log('Seed completed!');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
