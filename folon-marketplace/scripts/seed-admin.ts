import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@folon.app'
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })
  console.log(`✓ Admin user ready: ${email}`)
  console.log(`  Password: ${password}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
