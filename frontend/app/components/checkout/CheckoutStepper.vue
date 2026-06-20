<script setup lang="ts">
defineProps<{ step: 1 | 2 }>()

const steps = [
  { n: 1, label: 'Shipping' },
  { n: 2, label: 'Payment' },
]
</script>

<template>
  <nav class="flex items-center gap-0" aria-label="Checkout steps">
    <template v-for="(s, i) in steps" :key="s.n">
      <div class="flex items-center gap-2">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
            step >= s.n ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400',
          ]"
          :aria-current="step === s.n ? 'step' : undefined"
        >
          <svg v-if="step > s.n" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>{{ s.n }}</span>
        </div>
        <span :class="['text-sm font-medium', step >= s.n ? 'text-gray-900' : 'text-gray-400']">{{ s.label }}</span>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 h-px bg-gray-200 mx-3 min-w-[2rem]" aria-hidden="true" />
    </template>
  </nav>
</template>
