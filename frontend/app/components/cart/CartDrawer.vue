<script setup lang="ts">
import { useCart } from '~/composables/useCart'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { items, count } = useCart()

async function goToCheckout() {
  emit('close')
  await navigateTo('/checkout')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-40"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            Cart <span v-if="count" class="text-brand-600">({{ count }})</span>
          </h2>
          <button
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
            aria-label="Close cart"
            @click="emit('close')"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
          <p v-if="!items.length" class="py-16 text-center text-gray-400">Your cart is empty.</p>
          <CartItem v-for="item in items" :key="item.productId" :item="item" />
        </div>

        <div v-if="items.length" class="px-5 py-4 border-t border-gray-100">
          <CartSummary @checkout="goToCheckout" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>
