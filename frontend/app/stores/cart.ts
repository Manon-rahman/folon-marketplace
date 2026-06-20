import { defineStore } from 'pinia'
import type { CartItem } from '~/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  const count = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0),
  )

  function addItem(item: CartItem) {
    const existing = items.value.find((i) => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({ ...item })
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) {
      if (quantity <= 0) removeItem(productId)
      else item.quantity = quantity
    }
  }

  function clearCart() {
    items.value = []
  }

  return { items, total, count, addItem, removeItem, updateQuantity, clearCart }
}, { persist: true })
