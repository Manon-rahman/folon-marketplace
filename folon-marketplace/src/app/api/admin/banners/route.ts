import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
})

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const banners = await prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const banner = await prisma.banner.create({ data: parsed.data })
  return NextResponse.json(banner, { status: 201 })
}
