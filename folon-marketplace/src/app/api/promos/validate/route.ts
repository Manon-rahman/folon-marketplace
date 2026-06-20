import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ code: z.string(), subtotal: z.number().int().positive() })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { code, subtotal } = parsed.data
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } })

  if (!promo || !promo.active) return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
  if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: 'Promo code expired' }, { status: 400 })
  if (promo.maxUses && promo.usedCount >= promo.maxUses) return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })
  if (subtotal < promo.minOrderAmount) return NextResponse.json({ error: `Minimum order ৳${(promo.minOrderAmount / 100).toFixed(0)} required` }, { status: 400 })

  const discount = promo.type === 'percent'
    ? Math.floor(subtotal * promo.value / 100)
    : Math.min(promo.value, subtotal)

  return NextResponse.json({ valid: true, discount, type: promo.type, value: promo.value })
}
