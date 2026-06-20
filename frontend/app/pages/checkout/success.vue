<script setup lang="ts">
import type { Order, ApiResponse } from '~/types'
import { useCart } from '~/composables/useCart'

useSeoMeta({ title: 'Order Confirmed' })

const route = useRoute()
const config = useRuntimeConfig()
const { clearCart } = useCart()

const orderId = route.query.orderId as string
const isCod = route.query.method === 'cod'

if (!orderId) await navigateTo('/')

const order = ref<Order | null>(null)
const pollError = ref<string | null>(null)
const polling = ref(!isCod)

onMounted(async () => {
  if (isCod) {
    // COD orders are placed immediately — just fetch the order once and show it
    try {
      const res = await $fetch<ApiResponse<Order>>(`/orders/${orderId}`, {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })
      order.value = res.data
      clearCart()
    } catch {
      pollError.value = 'Could not load order details.'
    }
    return
  }

  // Stripe: poll until status = paid
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try {
      const res = await $fetch<ApiResponse<Order>>(`/orders/${orderId}`, {
        baseURL: config.public.apiBase,
        credentials: 'include',
      })
      order.value = res.data
      if (res.data.status === 'paid') {
        clearCart()
        polling.value = false
        return
      }
    } catch {
      // continue polling
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  polling.value = false
  if (!order.value) pollError.value = 'Could not confirm payment. Check your account for order status.'
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div v-if="polling && !order" class="flex flex-col items-center gap-4 py-20">
      <UiSpinner size="lg" />
      <p class="text-gray-500">Confirming your payment…</p>
    </div>

    <div v-else-if="pollError" class="text-center py-12">
      <p class="text-red-600 font-medium mb-4">{{ pollError }}</p>
      <NuxtLink to="/account" class="text-brand-600 hover:text-brand-700 font-medium">View My Orders →</NuxtLink>
    </div>

    <div v-else-if="order">
      <CheckoutConfirmationHero />

      <div v-if="isCod" class="mt-4 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
        📦 Your order will be paid on delivery. Please have the exact amount ready.
      </div>

      <div class="mt-4">
        <CheckoutOrderReceipt :order="order" />
      </div>

      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/"
          class="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
        >
          Continue Shopping
        </NuxtLink>
        <NuxtLink
          to="/account"
          class="inline-flex justify-center items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Track Order
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
