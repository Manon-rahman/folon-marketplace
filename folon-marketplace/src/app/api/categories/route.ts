import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { visible: true },
    orderBy: { displayOrder: 'asc' },
  })
  return NextResponse.json(categories)
}
