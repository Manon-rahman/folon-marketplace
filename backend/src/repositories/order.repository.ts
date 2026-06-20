import { pool } from '../db/pool'
import type { Order, OrderItem, Address } from '../types'

interface CreateOrderInput {
  userId: string | null
  email: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
  shippingAddress: Address
  totalAmount: number
  stripePaymentIntentId: string | null
}

export class OrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const { rows: [order] } = await client.query<{
        id: string; user_id: string | null; email: string; status: Order['status'];
        stripe_payment_intent_id: string; total_amount: number;
        shipping_address: Address; created_at: Date; updated_at: Date
      }>(
        `INSERT INTO orders(user_id, email, total_amount, shipping_address, stripe_payment_intent_id)
         VALUES($1, $2, $3, $4, $5)
         RETURNING *`,
        [input.userId, input.email, input.totalAmount, JSON.stringify(input.shippingAddress), input.stripePaymentIntentId],
      )

      for (const item of input.items) {
        // Lock row and verify stock
        const { rows } = await client.query<{ stock: number }>(
          `SELECT stock FROM products WHERE id = $1 FOR UPDATE`,
          [item.productId],
        )
        if (!rows[0] || rows[0].stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`)
        }
        await client.query(
          `INSERT INTO order_items(order_id, product_id, quantity, unit_price)
           VALUES($1, $2, $3, $4)`,
          [order.id, item.productId, item.quantity, item.unitPrice],
        )
      }

      await client.query('COMMIT')

      return {
        id: order.id,
        userId: order.user_id,
        email: order.email,
        status: order.status,
        stripePaymentIntentId: order.stripe_payment_intent_id,
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }

  async findById(id: string): Promise<Order | null> {
    const { rows } = await pool.query<{
      id: string; user_id: string | null; email: string; status: Order['status'];
      stripe_payment_intent_id: string; total_amount: number;
      shipping_address: Address; created_at: Date; updated_at: Date; items: OrderItem[]
    }>(
      `SELECT o.id, o.user_id, o.email, o.status, o.stripe_payment_intent_id,
              o.total_amount, o.shipping_address, o.created_at, o.updated_at,
              COALESCE(json_agg(
                json_build_object(
                  'id', oi.id,
                  'productId', oi.product_id,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'name', p.name
                )
              ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id],
    )
    if (!rows[0]) return null
    const r = rows[0]
    return {
      id: r.id,
      userId: r.user_id,
      email: r.email,
      status: r.status,
      stripePaymentIntentId: r.stripe_payment_intent_id,
      totalAmount: r.total_amount,
      shippingAddress: r.shipping_address,
      items: r.items,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  async markPaid(orderId: string, paymentIntentId: string): Promise<void> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const { rows } = await client.query<{ product_id: string; quantity: number }>(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [orderId],
      )

      for (const item of rows) {
        const { rowCount } = await client.query(
          `UPDATE products SET stock = stock - $1, updated_at = now()
           WHERE id = $2 AND stock >= $1`,
          [item.quantity, item.product_id],
        )
        if (!rowCount) throw new Error(`Failed to decrement stock for product ${item.product_id}`)
      }

      await client.query(
        `UPDATE orders SET status = 'paid', stripe_payment_intent_id = $1, updated_at = now()
         WHERE id = $2`,
        [paymentIntentId, orderId],
      )

      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }

  async findByUser(userId: string): Promise<Order[]> {
    const { rows } = await pool.query<{
      id: string; user_id: string | null; email: string; status: Order['status'];
      stripe_payment_intent_id: string; total_amount: number;
      shipping_address: Address; created_at: Date; updated_at: Date; items: OrderItem[]
    }>(
      `SELECT o.id, o.user_id, o.email, o.status, o.stripe_payment_intent_id,
              o.total_amount, o.shipping_address, o.created_at, o.updated_at,
              COALESCE(json_agg(
                json_build_object(
                  'id', oi.id,
                  'productId', oi.product_id,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'name', p.name
                )
              ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId],
    )
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      email: r.email,
      status: r.status,
      stripePaymentIntentId: r.stripe_payment_intent_id,
      totalAmount: r.total_amount,
      shippingAddress: r.shipping_address,
      items: r.items,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
  }
}
