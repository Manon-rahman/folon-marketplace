import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { displayOrder: 'asc' },
  })
  return NextResponse.json(banners)
}
