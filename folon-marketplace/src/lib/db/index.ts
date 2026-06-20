import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient; prismaVersion: string }

const SCHEMA_VERSION = '2' // increment whenever schema changes to bust stale singletons

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['error'] : [] })
}

const stale = process.env.NODE_ENV !== 'production' && globalForPrisma.prismaVersion !== SCHEMA_VERSION
export const prisma = (!stale && globalForPrisma.prisma) ? globalForPrisma.prisma : createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaVersion = SCHEMA_VERSION
}
