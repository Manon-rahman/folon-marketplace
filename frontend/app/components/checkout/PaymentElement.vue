<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

const props = defineProps<{ clientSecret: string }>()
const emit = defineEmits<{ success: []; error: [message: string] }>()

const config = useRuntimeConfig()
const loading = ref(false)
const stripeError = ref<string | null>(null)

let stripe: Stripe | null = null
let elements: StripeElements | null = null

onMounted(async () => {
  stripe = await loadStripe(config.public.stripePk)
  if (!stripe) {
    stripeError.value = 'Failed to load payment processor'
    return
  }
  elements = stripe.elements({ clientSecret: props.clientSecret, appearance: { theme: 'stripe' } })
  const paymentElement = elements.create('payment')
  paymentElement.mount('#stripe-payment-element')
})

onUnmounted(() => {
  elements?.getElement('payment')?.destroy()
})

async function submit() {
  if (!stripe || !elements) return
  loading.value = true
  stripeError.value = null
  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    })
    if (error) {
      stripeError.value = error.message ?? 'Payment failed'
    } else {
      emit('success')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <h2 class="text-lg font-semibold text-gray-900">Payment</h2>

    <div v-if="stripeError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
      {{ stripeError }}
    </div>

    <div id="stripe-payment-element" class="min-h-[200px]" />

    <UiButton type="button" size="lg" class="w-full" :loading="loading" @click="submit">
      Pay Now
    </UiButton>

    <p class="text-xs text-center text-gray-400">
      🔒 Payments are secured by Stripe. We never store card details.
    </p>
  </div>
</template>
