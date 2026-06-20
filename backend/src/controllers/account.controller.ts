import type { RequestHandler } from 'express'
import { OrderService } from '../services/order.service'
import { ok } from '../types'

const orderService = new OrderService()

export const getMyOrders: RequestHandler = async (req, res, next) => {
  try {
    const orders = await orderService.findByUser(req.user!.id)
    ok(res, orders)
  } catch (err) {
    next(err)
  }
}
