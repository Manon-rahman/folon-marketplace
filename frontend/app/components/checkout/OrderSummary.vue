<script setup lang="ts">
import { formatPrice } from '~/utils/format'
import { useCart } from '~/composables/useCart'

const { items, total } = useCart()
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-5 flex flex-col gap-4">
    <h3 class="text-sm font-semibold text-gray-900">Order Summary</h3>

    <ul class="flex flex-col gap-3 divide-y divide-gray-100">
      <li v-for="item in items" :key="item.productId" class="flex items-center gap-3 pt-3 first:pt-0">
        <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded bg-white border border-gray-100" loading="lazy" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
          <p class="text-xs text-gray-500">Qty {{ item.quantity }}</p>
        </div>
        <p class="text-sm font-semibold text-gray-900">{{ formatPrice(item.price * item.quantity) }}</p>
      </li>
    </ul>

    <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-sm">
      <span>Total</span>
      <span>{{ formatPrice(total) }}</span>
    </div>
  </div>
</template>
