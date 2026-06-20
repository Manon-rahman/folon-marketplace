<script setup lang="ts">
import type { Product } from '~/types'
import { useCart } from '~/composables/useCart'

const props = defineProps<{ product: Product }>()
const { addItem } = useCart()

const qty = ref(1)
const added = ref(false)
const isOutOfStock = computed(() => props.product.stock === 0)

function increment() { if (qty.value < props.product.stock) qty.value++ }
function decrement() { if (qty.value > 1) qty.value-- }

function addToCart() {
  addItem({
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.images[0] ?? '',
    quantity: qty.value,
    slug: props.product.slug,
  })
  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}

async function buyNow() {
  addToCart()
  await navigateTo('/checkout')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <p class="text-sm font-medium text-gray-700">Quantity</p>
      <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          class="px-3 py-2 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
          :disabled="qty <= 1"
          aria-label="Decrease quantity"
          @click="decrement"
        >
          −
        </button>
        <span class="px-4 py-2 text-sm font-medium text-gray-900 min-w-[2.5rem] text-center">{{ qty }}</span>
        <button
          class="px-3 py-2 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
          :disabled="qty >= product.stock"
          aria-label="Increase quantity"
          @click="increment"
        >
          +
        </button>
      </div>
      <p class="text-xs text-gray-500">{{ product.stock }} left</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <UiButton
        v-if="!isOutOfStock"
        size="lg"
        :class="['flex-1', added ? 'bg-green-600 hover:bg-green-600' : '']"
        @click="addToCart"
      >
        {{ added ? '✓ Added to Cart' : 'Add to Cart' }}
      </UiButton>

      <UiButton
        v-if="!isOutOfStock"
        size="lg"
        variant="secondary"
        class="flex-1"
        @click="buyNow"
      >
        Buy Now
      </UiButton>

      <UiButton v-if="isOutOfStock" size="lg" class="flex-1" disabled>
        Sold Out
      </UiButton>
    </div>
  </div>
</template>
