<script setup lang="ts">
import type { CartItem } from '~/types'
import { formatPrice } from '~/utils/format'
import { useCart } from '~/composables/useCart'

const props = defineProps<{ item: CartItem }>()
const { updateQuantity, removeItem } = useCart()
</script>

<template>
  <div class="flex gap-4 py-4">
    <NuxtLink :to="`/products/${item.slug}`" class="flex-shrink-0">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-16 h-16 object-cover rounded-lg bg-gray-100"
        loading="lazy"
      />
    </NuxtLink>

    <div class="flex-1 min-w-0">
      <NuxtLink :to="`/products/${item.slug}`" class="block font-medium text-sm text-gray-900 hover:text-brand-600 truncate">
        {{ item.name }}
      </NuxtLink>
      <p class="text-brand-600 font-semibold text-sm mt-0.5">{{ formatPrice(item.price) }}</p>

      <div class="flex items-center gap-2 mt-2">
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
          <button
            class="px-2 py-1 text-gray-500 hover:bg-gray-50 focus:outline-none disabled:opacity-40"
            :disabled="item.quantity <= 1"
            aria-label="Decrease quantity"
            @click="updateQuantity(item.productId, item.quantity - 1)"
          >−</button>
          <span class="px-2 py-1 font-medium text-gray-900">{{ item.quantity }}</span>
          <button
            class="px-2 py-1 text-gray-500 hover:bg-gray-50 focus:outline-none"
            aria-label="Increase quantity"
            @click="updateQuantity(item.productId, item.quantity + 1)"
          >+</button>
        </div>

        <button
          class="text-xs text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
          aria-label="Remove item"
          @click="removeItem(item.productId)"
        >
          Remove
        </button>

        <span class="ml-auto text-sm font-semibold text-gray-900">
          {{ formatPrice(item.price * item.quantity) }}
        </span>
      </div>
    </div>
  </div>
</template>
