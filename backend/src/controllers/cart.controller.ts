import type { RequestHandler } from 'express'
import { ProductService } from '../services/product.service'
import { ok } from '../types'

const productService = new ProductService()

export const validateCart: RequestHandler = async (req, res, next) => {
  try {
    const { items } = req.body as { items: Array<{ productId: string; quantity: number }> }
    const result = await productService.validateStock(items)
    ok(res, result)
  } catch (err) {
    next(err)
  }
}
