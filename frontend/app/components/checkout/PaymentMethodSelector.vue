<script setup lang="ts">
const selected = defineModel<'stripe' | 'cod'>({ default: 'stripe' })
defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ proceed: [] }>()

const options = [
  {
    value: 'stripe' as const,
    label: 'Pay with Card',
    description: 'Credit or debit card, Apple Pay, Google Pay',
    icon: '💳',
  },
  {
    value: 'cod' as const,
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives at your door',
    icon: '📦',
  },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-lg font-semibold text-gray-900">Payment Method</h2>

    <div class="flex flex-col gap-3" role="radiogroup" aria-label="Payment method">
      <label
        v-for="opt in options"
        :key="opt.value"
        :class="[
          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
          selected === opt.value
            ? 'border-brand-600 bg-brand-50'
            : 'border-gray-200 hover:border-gray-300 bg-white',
        ]"
      >
        <input
          v-model="selected"
          type="radio"
          :value="opt.value"
          class="sr-only"
          :aria-label="opt.label"
        />
        <span
          :class="[
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
            selected === opt.value ? 'border-brand-600' : 'border-gray-300',
          ]"
          aria-hidden="true"
        >
          <span
            v-if="selected === opt.value"
            class="w-2.5 h-2.5 rounded-full bg-brand-600"
          />
        </span>

        <span class="text-2xl leading-none" aria-hidden="true">{{ opt.icon }}</span>

        <span class="flex flex-col gap-0.5">
          <span class="font-semibold text-gray-900 text-sm">{{ opt.label }}</span>
          <span class="text-xs text-gray-500">{{ opt.description }}</span>
        </span>
      </label>
    </div>

    <UiButton size="lg" class="w-full" :loading="loading" @click="emit('proceed')">
      {{ selected === 'cod' ? 'Place Order' : 'Continue to Payment' }}
    </UiButton>
  </div>
</template>
