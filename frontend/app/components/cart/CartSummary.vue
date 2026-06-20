<script setup lang="ts">
import { formatPrice } from '~/utils/format'
import { useCart } from '~/composables/useCart'

const { total, count } = useCart()
const emit = defineEmits<{ checkout: [] }>()

const freeShippingThreshold = 10000
const shipping = computed(() => total.value >= freeShippingThreshold ? 0 : 799)
const grandTotal = computed(() => total.value + shipping.value)
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
    <div class="flex justify-between text-sm text-gray-600">
      <span>Subtotal ({{ count }} {{ count === 1 ? 'item' : 'items' }})</span>
      <span>{{ formatPrice(total) }}</span>
    </div>
    <div class="flex justify-between text-sm text-gray-600">
      <span>Shipping</span>
      <span>{{ shipping === 0 ? 'Free' : formatPrice(shipping) }}</span>
    </div>
    <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
      <span>Total</span>
      <span>{{ formatPrice(grandTotal) }}</span>
    </div>
    <p v-if="shipping > 0" class="text-xs text-gray-500 text-center">
      Add {{ formatPrice(freeShippingThreshold - total) }} more for free shipping
    </p>

    <UiButton size="lg" class="w-full mt-1" @click="emit('checkout')">
      Proceed to Checkout
    </UiButton>
  </div>
</template>
