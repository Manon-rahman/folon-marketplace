import Stripe from 'stripe'
import { OrderRepository } from '../repositories/order.repository'
import { ProductRepository } from '../repositories/product.repository'
import { env } from '../config/env'
import type { Address } from '../types'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)
const orderRepo = new OrderRepository()
const productRepo = new ProductRepository()

export class OrderService {
  async createOrder(input: {
    userId: string | null
    email: string
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: Address
    paymentMethod: 'stripe' | 'cod'
  }) {
    const ids = input.items.map((i) => i.productId)
    const products = await productRepo.findByIds(ids)
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of input.items) {
      const p = productMap.get(item.productId)
      if (!p || !p.active) throw Object.assign(new Error(`Product not found: ${item.productId}`), { code: 'PRODUCT_NOT_FOUND' })
      if (p.stock < item.quantity) throw Object.assign(new Error(`Insufficient stock: ${p.name}`), { code: 'INSUFFICIENT_STOCK' })
    }

    const itemsWithPrice = input.items.map((item) => ({
      ...item,
      unitPrice: productMap.get(item.productId)!.price,
    }))

    const totalAmount = itemsWithPrice.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    if (input.paymentMethod === 'cod') {
      const order = await orderRepo.create({
        userId: input.userId,
        email: input.email,
        items: itemsWithPrice,
        shippingAddress: input.shippingAddress,
        totalAmount,
        stripePaymentIntentId: null,
      })
      return { orderId: order.id, clientSecret: null, paymentMethod: 'cod' as const }
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalAmount,
        currency: 'usd',
        metadata: { email: input.email },
      },
      { idempotencyKey: `order-${input.email}-${Date.now()}` },
    )

    const order = await orderRepo.create({
      userId: input.userId,
      email: input.email,
      items: itemsWithPrice,
      shippingAddress: input.shippingAddress,
      totalAmount,
      stripePaymentIntentId: paymentIntent.id,
    })

    await stripe.paymentIntents.update(paymentIntent.id, { metadata: { orderId: order.id, email: input.email } })

    return { orderId: order.id, clientSecret: paymentIntent.client_secret!, paymentMethod: 'stripe' as const }
  }

  async findById(id: string) {
    return orderRepo.findById(id)
  }

  async markPaid(orderId: string, paymentIntentId: string) {
    return orderRepo.markPaid(orderId, paymentIntentId)
  }

  async findByUser(userId: string) {
    return orderRepo.findByUser(userId)
  }
}
