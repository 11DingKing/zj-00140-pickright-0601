import { PrismaClient } from '@prisma/client';
import path from 'path';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma;
