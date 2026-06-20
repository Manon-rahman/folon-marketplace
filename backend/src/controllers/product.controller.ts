import type { RequestHandler } from 'express'
import { ProductService } from '../services/product.service'
import { ok, fail } from '../types'

const productService = new ProductService()

export const listProducts: RequestHandler = async (req, res, next) => {
  try {
    const { categorySlug, sort, limit, offset } = req.query as Record<string, string>
    const result = await productService.list({
      categorySlug,
      sort,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    })
    ok(res, result)
  } catch (err) {
    next(err)
  }
}

export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await productService.findBySlug(req.params.slug)
    if (!product) return fail(res, 'NOT_FOUND', 'Product not found', 404)
    ok(res, product)
  } catch (err) {
    next(err)
  }
}
