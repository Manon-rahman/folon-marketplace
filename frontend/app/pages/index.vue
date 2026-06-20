<script setup lang="ts">
import type { Product, ApiResponse } from '~/types'

useSeoMeta({
  title: 'Sole District — Premium Sneakers',
  description: 'Premium sneakers, curated for every stride.',
})

const apiBase = useApiBase()
const sort = ref('newest')
const limit = 20
const offset = ref(0)
const allProducts = ref<Product[]>([])
const total = ref(0)
const loading = ref(false)
const initialLoaded = ref(false)

async function loadProducts(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    const data = await $fetch<ApiResponse<{ products: Product[]; total: number }>>('/products', {
      baseURL: apiBase,
      params: { categorySlug: 'sneakers', sort: sort.value, limit, offset: reset ? 0 : offset.value },
    })
    if (reset) {
      allProducts.value = data.data.products
      offset.value = data.data.products.length
    } else {
      allProducts.value.push(...data.data.products)
      offset.value += data.data.products.length
    }
    total.value = data.data.total
  } finally {
    loading.value = false
    initialLoaded.value = true
  }
}

await loadProducts(true)

watch(sort, () => loadProducts(true))
</script>

<template>
  <div>
    <ProductHeroBanner />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">All Sneakers</h2>
      <select
        v-model="sort"
        class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Sort products"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </div>

    <ProductGrid
      :products="allProducts"
      :loading="loading && !initialLoaded"
      :total="total"
      @load-more="loadProducts(false)"
    />
  </div>
</template>
