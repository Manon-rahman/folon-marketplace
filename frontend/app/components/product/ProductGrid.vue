<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  products: Product[]
  loading: boolean
  total: number
}>()

const emit = defineEmits<{ loadMore: [] }>()
</script>

<template>
  <section id="products" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="loading && !products.length" class="flex justify-center py-20" role="status" aria-label="Loading products">
      <UiSpinner size="lg" />
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
      aria-label="Products"
    >
      <div v-for="product in products" :key="product.id" role="listitem">
        <ProductCard :product="product" />
      </div>
    </div>

    <div v-if="products.length < total" class="flex justify-center mt-10">
      <button
        class="px-8 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
        :disabled="loading"
        @click="emit('loadMore')"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <UiSpinner size="sm" />
          Loading…
        </span>
        <span v-else>Load More ({{ total - products.length }} remaining)</span>
      </button>
    </div>
  </section>
</template>
