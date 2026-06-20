<template>
  <div class="flex flex-col items-center text-center py-8">
    <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-once">
      <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
    <p class="text-gray-500 text-lg">Thank you for your purchase. We've received your order.</p>
  </div>
</template>

<style scoped>
@keyframes bounce-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.animate-bounce-once { animation: bounce-once 0.6s ease-out; }
</style>
