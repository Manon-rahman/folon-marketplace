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
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  name: string
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
  createdAt: string
  updatedAt: string
}

export interface CartIssue {
  productId: string
  requested: number
  available: number
}

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: { code: string; message: string }
}
