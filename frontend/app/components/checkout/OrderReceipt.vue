<script setup lang="ts">
import type { Order } from '~/types'
import { formatPrice, formatDate } from '~/utils/format'

defineProps<{ order: Order }>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
        <p class="font-mono text-gray-900 text-xs break-all">{{ order.id }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
        <p class="text-gray-900">{{ formatDate(order.createdAt) }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
        <UiBadge variant="success" class="capitalize">{{ order.status }}</UiBadge>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total</p>
        <p class="font-bold text-gray-900">{{ formatPrice(order.totalAmount) }}</p>
      </div>
    </div>

    <div v-if="order.items?.length">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
      <ul class="flex flex-col gap-2">
        <li v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
          <span class="text-gray-700">{{ item.name }} × {{ item.quantity }}</span>
          <span class="font-medium text-gray-900">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
        </li>
      </ul>
    </div>

    <div>
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ships To</p>
      <address class="text-sm text-gray-700 not-italic leading-relaxed">
        {{ order.shippingAddress.name }}<br />
        {{ order.shippingAddress.line1 }}<br />
        <span v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}<br /></span>
        {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}<br />
        {{ order.shippingAddress.country }}
      </address>
    </div>
  </div>
</template>
