import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendSms, orderConfirmationMessage } from '@/lib/sms'
import { createPayment } from '@/lib/bkash'
import { appConfig } from '@/lib/config'

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  bundle: z.enum(['1x', '5x', '10x']).optional().default('1x'),
})

const schema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(10),
  customerArea: z.string().min(1),
  items: z.array(itemSchema).min(1),
  promoCode: z.string().optional(),
  paymentMethod: z.enum(['bkash', 'cod']),
  deliveryFee: z.number().int().min(0).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { customerName, customerPhone, customerArea, items, promoCode, paymentMethod } = parsed.data

  // Fetch products and verify stock
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, visible: true } })
  if (products.length !== productIds.length) return NextResponse.json({ error: 'One or more products not found' }, { status: 400 })

  // Calculate subtotal using bundle price if applicable
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    let unitPrice = product.price
    if (item.bundle === '5x' && product.bundle5Price) unitPrice = product.bundle5Price
    if (item.bundle === '10x' && product.bundle10Price) unitPrice = product.bundle10Price
    return sum + unitPrice * item.quantity
  }, 0)

  // Validate promo
  let discountAmount = 0
  let validatedPromoCode: string | undefined
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } })
    if (promo && promo.active && (!promo.expiresAt || promo.expiresAt > new Date()) && (!promo.maxUses || promo.usedCount < promo.maxUses) && subtotal >= promo.minOrderAmount) {
      discountAmount = promo.type === 'percent'
        ? Math.floor(subtotal * promo.value / 100)
        : Math.min(promo.value, subtotal)
      validatedPromoCode = promo.code
    }
  }

  // Calculate delivery fee server-side from settings
  const settingRows = await prisma.setting.findMany({ where: { key: { in: ['delivery_fee', 'free_delivery_min_items'] } } })
  const settingsMap = Object.fromEntries(settingRows.map((r) => [r.key, r.value]))
  const feeAmount = parseInt(settingsMap['delivery_fee'] ?? '6000')
  const freeThreshold = parseInt(settingsMap['free_delivery_min_items'] ?? '2')
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const deliveryFee = totalItems >= freeThreshold ? 0 : feeAmount

  const total = subtotal - discountAmount + deliveryFee

  // Create order
  const order = await prisma.order.create({
    data: {
      customerName,
      customerPhone,
      customerArea,
      subtotal,
      discountAmount,
      deliveryFee,
      total,
      promoCodeUsed: validatedPromoCode,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending_cod' : 'pending_payment',
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!
          let unitPrice = product.price
          if (item.bundle === '5x' && product.bundle5Price) unitPrice = product.bundle5Price
          if (item.bundle === '10x' && product.bundle10Price) unitPrice = product.bundle10Price
          return { productId: item.productId, name: product.name, price: unitPrice, quantity: item.quantity }
        }),
      },
    },
  })

  // Increment promo usage
  if (validatedPromoCode) {
    await prisma.promoCode.update({ where: { code: validatedPromoCode }, data: { usedCount: { increment: 1 } } })
  }

  if (paymentMethod === 'cod') {
    sendSms(customerPhone, orderConfirmationMessage({ orderId: order.id, total, method: 'cod' })).catch(() => {})
    return NextResponse.json({ orderId: order.id, status: 'pending_cod' })
  }

  // bKash payment
  try {
    const callbackUrl = `${appConfig.baseUrl}/api/bkash/callback?orderId=${order.id}`
    const payment = await createPayment({ amount: (total / 100).toFixed(2), orderId: order.id, callbackUrl })
    await prisma.order.update({ where: { id: order.id }, data: { bkashPaymentId: payment.paymentID } })
    return NextResponse.json({ orderId: order.id, bkashURL: payment.bkashURL, paymentID: payment.paymentID })
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled' } })
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 502 })
  }
}
