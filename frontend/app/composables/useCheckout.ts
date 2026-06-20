import type { Address, Order, ApiResponse } from '~/types'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

interface CreateOrderResponse {
  orderId: string
  clientSecret: string | null
  paymentMethod: 'stripe' | 'cod'
}

export function useCheckout() {
  const config = useRuntimeConfig()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createOrder(email: string, shippingAddress: Address, paymentMethod: 'stripe' | 'cod' = 'stripe') {
    loading.value = true
    error.value = null
    try {
      const headers: Record<string, string> = {}
      if (authStore.accessToken) {
        headers['Authorization'] = `Bearer ${authStore.accessToken}`
      }

      const result = await $fetch<ApiResponse<CreateOrderResponse>>('/orders', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers,
        credentials: 'include',
        body: {
          email,
          items: cartStore.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress,
          paymentMethod,
        },
      })
      return result.data
    } catch (e: unknown) {
      const msg = (e as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Failed to create order'
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  async function pollOrderStatus(orderId: string, maxMs = 10_000): Promise<Order> {
    const deadline = Date.now() + maxMs
    while (Date.now() < deadline) {
      const result = await $fetch<ApiResponse<Order>>(`/orders/${orderId}`, {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })
      if (result.data.status === 'paid') return result.data
      await new Promise((r) => setTimeout(r, 1000))
    }
    throw new Error('Payment confirmation timed out')
  }

  return { createOrder, pollOrderStatus, loading, error }
}
