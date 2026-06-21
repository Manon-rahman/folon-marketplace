import { config } from 'dotenv'
config({ path: '.env.local' })
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

async function toBase64(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  const compressed = await sharp(buffer)
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer()
  return `data:image/jpeg;base64,${compressed.toString('base64')}`
}

function getFilename(url: string): string | null {
  if (url.startsWith('/uploads/')) return url.replace('/uploads/', '')
  return null
}

async function run() {
  console.log('Migrating product images...')
  const products = await prisma.product.findMany()
  for (const product of products) {
    const needsMigration = product.images.some((img) => img.startsWith('/uploads/'))
    if (!needsMigration) continue

    const newImages: string[] = []
    for (const img of product.images) {
      const filename = getFilename(img)
      if (!filename) { newImages.push(img); continue }
      const filePath = path.join(UPLOADS_DIR, filename)
      try {
        const base64 = await toBase64(filePath)
        newImages.push(base64)
        console.log(`  ✓ ${product.name}: converted ${filename}`)
      } catch {
        console.warn(`  ✗ ${product.name}: missing file ${filename}, skipping`)
      }
    }
    await prisma.product.update({ where: { id: product.id }, data: { images: newImages } })
  }

  console.log('\nMigrating banner images...')
  const banners = await prisma.banner.findMany()
  for (const banner of banners) {
    const filename = getFilename(banner.imageUrl)
    if (!filename) continue
    const filePath = path.join(UPLOADS_DIR, filename)
    try {
      const base64 = await toBase64(filePath)
      await prisma.banner.update({ where: { id: banner.id }, data: { imageUrl: base64 } })
      console.log(`  ✓ Banner ${banner.id}: converted ${filename}`)
    } catch {
      console.warn(`  ✗ Banner ${banner.id}: missing file ${filename}, skipping`)
    }
  }

  console.log('\nDone.')
  await prisma.$disconnect()
  await pool.end()
}

run().catch((e) => { console.error(e); process.exit(1) })
