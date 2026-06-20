import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ['delivery_fee', 'free_delivery_min_items', 'marquee_text'] } },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return NextResponse.json({
    deliveryFee: parseInt(map['delivery_fee'] ?? '6000'),
    freeDeliveryMinItems: parseInt(map['free_delivery_min_items'] ?? '2'),
    marqueeText: map['marquee_text'] ?? null,
  })
}
