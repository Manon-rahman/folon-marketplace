<script setup lang="ts">
import type { Product } from '~/types'
import { formatPrice } from '~/utils/format'
import { useCart } from '~/composables/useCart'

const props = defineProps<{ product: Product }>()
const { addItem } = useCart()
const added = ref(false)

function handleAddToCart() {
  addItem({
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.images[0] ?? '',
    quantity: 1,
    slug: props.product.slug,
  })
  added.value = true
  setTimeout(() => { added.value = false }, 1500)
}

const isOutOfStock = computed(() => props.product.stock === 0)
</script>

<template>
  <article class="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <NuxtLink :to="`/products/${product.slug}`" class="block relative aspect-square overflow-hidden bg-gray-50">
      <img
        v-if="product.images[0]"
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div v-if="isOutOfStock" class="absolute inset-0 bg-white/70 flex items-center justify-center">
        <UiBadge variant="neutral">Sold Out</UiBadge>
      </div>
    </NuxtLink>

    <div class="p-4 flex flex-col flex-1">
      <NuxtLink :to="`/products/${product.slug}`">
        <h2 class="font-semibold text-gray-900 hover:text-brand-600 transition-colors text-sm leading-snug mb-1">
          {{ product.name }}
        </h2>
      </NuxtLink>
      <p class="text-brand-600 font-bold text-base mt-auto pt-2">{{ formatPrice(product.price) }}</p>

      <button
        v-if="!isOutOfStock"
        :class="[
          'mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500',
          added
            ? 'bg-green-600 text-white'
            : 'bg-brand-600 hover:bg-brand-700 text-white',
        ]"
        @click.prevent="handleAddToCart"
      >
        {{ added ? 'Added!' : 'Add to Cart' }}
      </button>
      <button
        v-else
        class="mt-3 w-full py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-500 cursor-not-allowed"
        disabled
        aria-disabled="true"
      >
        Notify Me
      </button>
    </div>
  </article>
</template>
