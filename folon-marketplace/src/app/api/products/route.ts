import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')

  const products = await prisma.product.findMany({
    where: {
      visible: true,
      ...(categorySlug && categorySlug !== 'all'
        ? { category: { slug: categorySlug } }
        : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}
