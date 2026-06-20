<script setup lang="ts">
import { z } from 'zod'
import type { Address } from '~/types'

defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ submit: [email: string, address: Address] }>()

const email = ref('')
const form = reactive<Address>({ name: '', line1: '', line2: '', city: '', postalCode: '', country: 'US' })
const errors = ref<Partial<Record<keyof Address | 'email', string>>>({})

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'Name required'),
  line1: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  postalCode: z.string().min(1, 'Postal code required'),
  country: z.string().length(2, 'Use 2-letter country code'),
})

function handleSubmit() {
  const result = schema.safeParse({ email: email.value, ...form })
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors
    errors.value = Object.fromEntries(
      Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? '']),
    ) as typeof errors.value
    return
  }
  errors.value = {}
  emit('submit', email.value, { ...form })
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
    <h2 class="text-lg font-semibold text-gray-900">Contact & Shipping</h2>

    <UiInput
      v-model="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      autocomplete="email"
      :required="true"
      :error="errors.email"
    />

    <UiInput
      v-model="form.name"
      label="Full Name"
      autocomplete="name"
      :required="true"
      :error="errors.name"
    />

    <UiInput
      v-model="form.line1"
      label="Address"
      autocomplete="address-line1"
      :required="true"
      :error="errors.line1"
    />

    <UiInput
      v-model="form.line2"
      label="Apartment, suite, etc."
      autocomplete="address-line2"
    />

    <div class="grid grid-cols-2 gap-4">
      <UiInput
        v-model="form.city"
        label="City"
        autocomplete="address-level2"
        :required="true"
        :error="errors.city"
      />
      <UiInput
        v-model="form.postalCode"
        label="Postal Code"
        autocomplete="postal-code"
        :required="true"
        :error="errors.postalCode"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700">Country <span class="text-red-500" aria-hidden="true">*</span></label>
      <select
        v-model="form.country"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        autocomplete="country"
        required
      >
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <option value="AU">Australia</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
      </select>
      <p v-if="errors.country" class="text-xs text-red-600">{{ errors.country }}</p>
    </div>

    <UiButton type="submit" size="lg" class="w-full" :loading="loading">Continue to Payment</UiButton>
  </form>
</template>
