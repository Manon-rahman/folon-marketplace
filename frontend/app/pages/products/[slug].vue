<script setup lang="ts">
import type { Product } from '~/types'
import { formatPrice } from '~/utils/format'

definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const apiBase = useApiBase()
const slug = route.params.slug as string

const { data: raw, error } = await useFetch<{ success: boolean; data: Product }>(`/products/${slug}`, {
  baseURL: apiBase,
  key: `product-${slug}`,
})

const product = computed(() => raw.value?.data ?? null)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, message: 'Product not found' })
}

useSeoMeta({
  title: () => product.value?.name ?? 'Product',
  description: () => product.value?.description ?? '',
  ogImage: () => product.value?.images?.[0] ?? '',
})

const sizes = ['7', '8', '9', '10', '11', '12']
const selectedSize = ref('')
</script>

<template>
  <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/" class="hover:text-brand-600">Sneakers</NuxtLink>
      <span aria-hidden="true">/</span>
      <span class="text-gray-900 font-medium" aria-current="page">{{ product.name }}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ProductGallery :images="product.images" :name="product.name" />

      <div class="flex flex-col gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 mb-2">{{ product.name }}</h1>
          <p class="text-2xl font-bold text-brand-600">{{ formatPrice(product.price) }}</p>
          <p class="mt-1 text-sm">
            <span v-if="product.stock > 0" class="text-green-600 font-medium">In Stock</span>
            <span v-else class="text-red-600 font-medium">Sold Out</span>
          </p>
        </div>

        <ProductVariantSelector v-model="selectedSize" :sizes="sizes" />
        <ProductAddToCartForm :product="product" />
        <ProductProductDetails :description="product.description" />
      </div>
    </div>
  </div>
</template>
