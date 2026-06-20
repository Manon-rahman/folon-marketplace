import { ProductRepository } from '../repositories/product.repository'
import type { Product } from '../types'

const repo = new ProductRepository()

export class ProductService {
  async list(opts: { categorySlug?: string; sort?: string; limit?: number; offset?: number }) {
    return repo.findAll({
      categorySlug: opts.categorySlug,
      sort: opts.sort as 'price_asc' | 'price_desc' | 'newest' | undefined,
      limit: Math.min(opts.limit ?? 20, 100),
      offset: opts.offset ?? 0,
    })
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return repo.findBySlug(slug)
  }

  async validateStock(items: Array<{ productId: string; quantity: number }>) {
    const ids = items.map((i) => i.productId)
    const products = await repo.findByIds(ids)
    const productMap = new Map(products.map((p) => [p.id, p]))

    const issues = items.flatMap((item) => {
      const product = productMap.get(item.productId)
      if (!product || !product.active || product.stock < item.quantity) {
        return [{
          productId: item.productId,
          requested: item.quantity,
          available: product?.stock ?? 0,
        }]
      }
      return []
    })

    return { valid: issues.length === 0, issues }
  }
}
