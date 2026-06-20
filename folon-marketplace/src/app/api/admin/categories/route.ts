import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { toSlug } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1), displayOrder: z.number().int().default(0) })

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  try {
    const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  try {
    const slug = toSlug(parsed.data.name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 })
    const category = await prisma.category.create({ data: { ...parsed.data, slug } })
    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
