import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string().min(1)).min(1),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  bundle5Price: z.number().int().positive().optional().nullable(),
  bundle10Price: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  visible: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
})

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  try {
    const product = await prisma.product.create({ data: parsed.data })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/products]', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
