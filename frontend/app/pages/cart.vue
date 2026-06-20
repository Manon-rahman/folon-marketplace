<script setup lang="ts">
import { useCart } from '~/composables/useCart'

useSeoMeta({ title: 'Cart' })

const { items } = useCart()
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

    <div v-if="!items.length" class="text-center py-20">
      <p class="text-gray-400 text-lg mb-6">Your cart is empty.</p>
      <NuxtLink to="/" class="text-brand-600 font-medium hover:text-brand-700">Continue Shopping →</NuxtLink>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div class="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white px-4">
        <CartItem v-for="item in items" :key="item.productId" :item="item" />
      </div>
      <CartSummary @checkout="navigateTo('/checkout')" />
    </div>
  </div>
</template>
