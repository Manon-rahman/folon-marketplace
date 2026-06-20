<script setup lang="ts">
import type { Order, ApiResponse } from '~/types'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/auth'
import { formatPrice, formatDate } from '~/utils/format'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'My Account' })

const { user } = useAuth()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const orders = ref<Order[]>([])
const pending = ref(true)
const fetchError = ref(false)

onMounted(async () => {
  try {
    const res = await $fetch<ApiResponse<Order[]>>('/account/orders', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : {},
    })
    orders.value = res.data
  } catch {
    fetchError.value = true
  } finally {
    pending.value = false
  }
})

const statusColor: Record<string, 'success' | 'neutral' | 'warning' | 'error'> = {
  paid: 'success',
  shipped: 'success',
  pending: 'warning',
  cancelled: 'error',
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Account</h1>
        <p class="text-sm text-gray-500 mt-1">{{ user?.email }}</p>
      </div>
    </div>

    <h2 class="text-lg font-semibold text-gray-900 mb-4">Order History</h2>

    <div v-if="pending" class="flex justify-center py-12">
      <UiSpinner size="lg" />
    </div>

    <div v-else-if="fetchError" class="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
      Failed to load orders. Please try again.
    </div>

    <div v-else-if="!orders.length" class="text-center py-16 text-gray-400">
      <p class="mb-4">No orders yet.</p>
      <NuxtLink to="/" class="text-brand-600 font-medium hover:text-brand-700">Start Shopping →</NuxtLink>
    </div>

    <ul v-else class="flex flex-col gap-4">
      <li
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <div class="flex items-start justify-between gap-4 mb-3">
          <div>
            <p class="text-xs font-mono text-gray-400 mb-1">{{ order.id }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
          </div>
          <UiBadge :variant="statusColor[order.status] ?? 'neutral'" class="capitalize">
            {{ order.status }}
          </UiBadge>
        </div>

        <ul v-if="order.items?.length" class="text-sm text-gray-600 flex flex-col gap-1 mb-3">
          <li v-for="item in order.items" :key="item.id">
            {{ item.name }} × {{ item.quantity }} — {{ formatPrice(item.unitPrice * item.quantity) }}
          </li>
        </ul>

        <div class="flex items-center justify-between text-sm border-t border-gray-100 pt-3 mt-3">
          <span class="text-gray-500">Total</span>
          <span class="font-bold text-gray-900">{{ formatPrice(order.totalAmount) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
