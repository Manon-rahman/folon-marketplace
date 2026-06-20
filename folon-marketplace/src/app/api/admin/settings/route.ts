import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  delivery_fee: z.number().int().min(0),
  free_delivery_min_items: z.number().int().min(1),
  marquee_text: z.string().optional(),
})

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const rows = await prisma.setting.findMany()
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])))
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const upserts = [
    prisma.setting.upsert({ where: { key: 'delivery_fee' }, update: { value: String(parsed.data.delivery_fee) }, create: { key: 'delivery_fee', value: String(parsed.data.delivery_fee) } }),
    prisma.setting.upsert({ where: { key: 'free_delivery_min_items' }, update: { value: String(parsed.data.free_delivery_min_items) }, create: { key: 'free_delivery_min_items', value: String(parsed.data.free_delivery_min_items) } }),
  ]
  if (parsed.data.marquee_text !== undefined) {
    upserts.push(prisma.setting.upsert({ where: { key: 'marquee_text' }, update: { value: parsed.data.marquee_text }, create: { key: 'marquee_text', value: parsed.data.marquee_text } }))
  }
  await Promise.all(upserts)
  return NextResponse.json({ ok: true })
}
