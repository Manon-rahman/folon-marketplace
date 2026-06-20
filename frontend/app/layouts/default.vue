<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useAuth } from '~/composables/useAuth'

const { count } = useCart()
const { isLoggedIn, logout } = useAuth()
const cartOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold tracking-tight text-surface">
          Sole District
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <NuxtLink to="/" class="hover:text-brand-600 transition-colors">Shop</NuxtLink>
          <NuxtLink v-if="isLoggedIn" to="/account" class="hover:text-brand-600 transition-colors">Account</NuxtLink>
          <NuxtLink v-else to="/account/login" class="hover:text-brand-600 transition-colors">Sign In</NuxtLink>
          <button
            v-if="isLoggedIn"
            class="hover:text-brand-600 transition-colors"
            @click="logout"
          >
            Sign Out
          </button>
        </nav>

        <button
          class="relative p-2 text-gray-700 hover:text-brand-600 transition-colors"
          aria-label="Open cart"
          @click="cartOpen = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span
            v-if="count > 0"
            class="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {{ count > 99 ? '99+' : count }}
          </span>
        </button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-gray-50 border-t border-gray-100 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Sole District. All rights reserved.
      </div>
    </footer>

    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
  </div>
</template>
