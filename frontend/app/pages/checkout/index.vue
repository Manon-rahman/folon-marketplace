<script setup lang="ts">
import type { Address } from '~/types'
import { useCheckout } from '~/composables/useCheckout'
import { useCart } from '~/composables/useCart'

useSeoMeta({ title: 'Checkout' })

const { items } = useCart()
const { createOrder, loading, error } = useCheckout()

// step 1 = address, 2 = payment method, 3 = stripe elements
const step = ref<1 | 2 | 3>(1)
const paymentMethod = ref<'stripe' | 'cod'>('stripe')
const clientSecret = ref<string | null>(null)
const orderId = ref<string | null>(null)
const savedEmail = ref('')
const savedAddress = ref<Address | null>(null)
const toastVisible = ref(false)
const toastMessage = ref('')

if (!items.value.length) {
  await navigateTo('/cart')
}

function onAddressSubmit(email: string, address: Address) {
  savedEmail.value = email
  savedAddress.value = address
  step.value = 2
}

async function onProceed() {
  if (!savedAddress.value) return
  try {
    const result = await createOrder(savedEmail.value, savedAddress.value, paymentMethod.value)
    orderId.value = result.orderId

    if (result.paymentMethod === 'cod') {
      await navigateTo(`/checkout/success?orderId=${result.orderId}&method=cod`)
      return
    }

    clientSecret.value = result.clientSecret
    step.value = 3
  } catch {
    toastMessage.value = error.value ?? 'Failed to create order'
    toastVisible.value = true
  }
}

async function onPaymentSuccess() {
  await navigateTo(`/checkout/success?orderId=${orderId.value}`)
}

function onPaymentError(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="mb-8">
      <CheckoutStepper :step="step === 1 ? 1 : 2" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div class="lg:col-span-3">

        <!-- Step 1: Address -->
        <div v-if="step === 1">
          <CheckoutAddressForm :loading="loading" @submit="onAddressSubmit" />
        </div>

        <!-- Step 2: Payment method selection -->
        <div v-else-if="step === 2">
          <button
            class="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-6"
            @click="step = 1"
          >
            ← Back to Shipping
          </button>
          <CheckoutPaymentMethodSelector
            v-model="paymentMethod"
            :loading="loading"
            @proceed="onProceed"
          />
        </div>

        <!-- Step 3: Stripe Elements (card only) -->
        <div v-else-if="step === 3 && clientSecret">
          <button
            class="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-6"
            @click="step = 2"
          >
            ← Back to Payment Method
          </button>
          <CheckoutPaymentElement
            :client-secret="clientSecret"
            @success="onPaymentSuccess"
            @error="onPaymentError"
          />
        </div>

      </div>

      <div class="lg:col-span-2">
        <CheckoutOrderSummary />
      </div>
    </div>

    <UiToast :message="toastMessage" type="error" :visible="toastVisible" @close="toastVisible = false" />
  </div>
</template>
