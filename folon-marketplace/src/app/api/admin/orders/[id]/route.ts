import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['pending_payment', 'pending_cod', 'paid', 'confirmed', 'shipped', 'cancelled']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const order = await prisma.order.update({ where: { id }, data: parsed.data })
  return NextResponse.json(order)
}
