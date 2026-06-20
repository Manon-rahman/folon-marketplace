export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ClearCartOnLoad from '@/components/storefront/ClearCartOnLoad'
import ConfirmationContent from '@/components/storefront/ConfirmationContent'

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) notFound()

  return (
    <>
      <ClearCartOnLoad />
      <ConfirmationContent
        orderId={order.id}
        isCod={order.paymentMethod === 'cod'}
        items={order.items.map((i) => ({ id: i.id, name: i.name, price: Number(i.price), quantity: i.quantity }))}
        discountAmount={Number(order.discountAmount)}
        total={Number(order.total)}
        customerName={order.customerName}
        customerPhone={order.customerPhone}
        customerArea={order.customerArea}
      />
    </>
  )
}
