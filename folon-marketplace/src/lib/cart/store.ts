'use client'

export interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  bundle5Price?: number
  bundle10Price?: number
  image: string
  quantity: number
}

const CART_KEY = 'fm_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart()
  const idx = cart.findIndex((i) => i.productId === item.productId)
  if (idx >= 0) {
    cart[idx].quantity += 1
    cart[idx].bundle5Price = item.bundle5Price
    cart[idx].bundle10Price = item.bundle10Price
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  saveCart(cart)
}

export function updateQuantity(productId: string, quantity: number): void {
  const cart = getCart()
  if (quantity <= 0) {
    saveCart(cart.filter((i) => i.productId !== productId))
  } else {
    const idx = cart.findIndex((i) => i.productId === productId)
    if (idx >= 0) cart[idx].quantity = quantity
    saveCart(cart)
  }
}

export function updateCartItem(productId: string, updates: Partial<CartItem>): void {
  const cart = getCart()
  const idx = cart.findIndex((i) => i.productId === productId)
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], ...updates }
    saveCart(cart)
  }
}

export function clearCart(): void {
  saveCart([])
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}
