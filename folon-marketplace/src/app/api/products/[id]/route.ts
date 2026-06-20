import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true, slug: true } } },
  })
  if (!product || !product.visible) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}
