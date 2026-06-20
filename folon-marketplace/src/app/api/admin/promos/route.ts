import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(2).max(20).transform((s) => s.toUpperCase()),
  type: z.enum(['percent', 'flat']),
  value: z.number().int().positive(),
  minOrderAmount: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable().transform((s) => s ? new Date(s) : null),
})

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const promo = await prisma.promoCode.create({ data: parsed.data })
  return NextResponse.json(promo, { status: 201 })
}
