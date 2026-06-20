import { pool } from '../db/pool'
import type { Product } from '../types'

interface ListOptions {
  categorySlug?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  limit: number
  offset: number
}

export class ProductRepository {
  async findAll(opts: ListOptions): Promise<{ products: Product[]; total: number }> {
    const params: unknown[] = []
    const conditions: string[] = ['p.active = true']

    if (opts.categorySlug) {
      params.push(opts.categorySlug)
      conditions.push(`c.slug = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderMap: Record<string, string> = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.created_at DESC',
    }
    const order = orderMap[opts.sort ?? 'newest'] ?? 'p.created_at DESC'

    params.push(opts.limit, opts.offset)
    const limitClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`

    const [dataResult, countResult] = await Promise.all([
      pool.query<Product>(
        `SELECT p.id, p.category_id AS "categoryId", p.name, p.slug, p.description,
                p.price, p.images, p.stock, p.active, p.metadata,
                p.created_at AS "createdAt", p.updated_at AS "updatedAt"
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${where}
         ORDER BY ${order}
         ${limitClause}`,
        params,
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) FROM products p JOIN categories c ON c.id = p.category_id ${where}`,
        params.slice(0, params.length - 2),
      ),
    ])

    return { products: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { rows } = await pool.query<Product>(
      `SELECT id, category_id AS "categoryId", name, slug, description,
              price, images, stock, active, metadata,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM products WHERE slug = $1 AND active = true`,
      [slug],
    )
    return rows[0] ?? null
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return []
    const { rows } = await pool.query<Product>(
      `SELECT id, name, slug, price, stock, images, active
       FROM products WHERE id = ANY($1)`,
      [ids],
    )
    return rows
  }
}
