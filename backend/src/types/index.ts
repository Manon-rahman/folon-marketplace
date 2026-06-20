import type { Response } from 'express'

export interface Product {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  stock: number
  active: boolean
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string | null
  email: string
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  stripePaymentIntentId: string | null
  totalAmount: number
  shippingAddress: Address
  items?: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  name?: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
  name: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface CartIssue {
  productId: string
  requested: number
  available: number
}

export const ok = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ success: true, data })

export const fail = (res: Response, code: string, message: string, status = 400) =>
  res.status(status).json({ success: false, error: { code, message } })

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: 'user' | 'admin' }
    }
  }
}
