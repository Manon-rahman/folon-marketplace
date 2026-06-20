import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.number().int().positive().optional(),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  bundle5Price: z.number().int().positive().optional().nullable(),
  bundle10Price: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  try {
    const product = await prisma.product.update({ where: { id }, data: parsed.data })
    return NextResponse.json(product)
  } catch (err) {
    console.error('[PATCH /api/admin/products]', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
