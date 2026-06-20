import type { RequestHandler } from 'express'
import { OrderService } from '../services/order.service'
import { ok, fail } from '../types'

const orderService = new OrderService()

export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const { items, shippingAddress, email, paymentMethod } = req.body as {
      items: Array<{ productId: string; quantity: number }>
      shippingAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string; name: string }
      email: string
      paymentMethod: 'stripe' | 'cod'
    }
    const result = await orderService.createOrder({
      userId: req.user?.id ?? null,
      email,
      items,
      shippingAddress,
      paymentMethod,
    })
    ok(res, result, 201)
  } catch (err: unknown) {
    const e = err as { code?: string; message: string }
    if (e.code === 'INSUFFICIENT_STOCK') return fail(res, 'INSUFFICIENT_STOCK', e.message)
    if (e.code === 'PRODUCT_NOT_FOUND') return fail(res, 'PRODUCT_NOT_FOUND', e.message, 404)
    next(err)
  }
}

export const getOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.findById(req.params.id)
    if (!order) return fail(res, 'NOT_FOUND', 'Order not found', 404)
    ok(res, order)
  } catch (err) {
    next(err)
  }
}
