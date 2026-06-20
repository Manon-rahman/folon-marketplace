import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { executePayment } from '@/lib/bkash'
import { sendSms, orderConfirmationMessage } from '@/lib/sms'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const paymentID = searchParams.get('paymentID')
  const status = searchParams.get('status')

  if (!orderId || !paymentID || status !== 'success') {
    return NextResponse.redirect(new URL(`/checkout/failed?orderId=${orderId ?? ''}`, req.url))
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.bkashPaymentId !== paymentID) throw new Error('Order mismatch')

    const result = await executePayment(paymentID)
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid', bkashTrxId: result.trxID },
    })

    sendSms(order.customerPhone, orderConfirmationMessage({ orderId: order.id, total: order.total, method: 'bkash' })).catch(() => {})

    return NextResponse.redirect(new URL(`/orders/${orderId}/confirmation`, req.url))
  } catch {
    return NextResponse.redirect(new URL(`/checkout/failed?orderId=${orderId}`, req.url))
  }
}
