# FRONTEND.md — Nuxt 4 Conventions

## Setup

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview
```

---

## Nuxt 4 Key Differences (from Nuxt 3)

- `app/` directory is now the root (replaces `src/` convention).
- `useAsyncData` and `useFetch` are typed with generics — always type them.
- `definePageMeta` is Nuxt 4's standard for route metadata.
- `nuxt.config.ts` → use `future: { compatibilityVersion: 4 }`.

---

## nuxt.config.ts Template

```ts
export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  ssr: true,
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    // Server-only (not exposed to browser)
    stripeSecretKey: '',
    // Public — available on client
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api',
      stripePk: process.env.NUXT_PUBLIC_STRIPE_PK ?? '',
    },
  },
  typescript: { strict: true },
})
```

---

## Composable Patterns

### `composables/useProducts.ts`

```ts
export const useProducts = () => {
  const { data: products, pending, error } = useFetch<Product[]>(
    '/products',
    { baseURL: useRuntimeConfig().public.apiBase, key: 'products' }
  )
  return { products, pending, error }
}
```

### `composables/useCart.ts`

```ts
// Cart state lives in Pinia (see stores/cart.ts)
// This composable exposes actions + computed helpers
export const useCart = () => {
  const store = useCartStore()
  return {
    items: computed(() => store.items),
    total: computed(() => store.total),
    addItem: store.addItem,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
  }
}
```

---

## Pinia Stores

### `stores/cart.ts`

```ts
import { defineStore } from 'pinia'
import type { CartItem } from '~/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  const addItem = (item: CartItem) => {
    const existing = items.value.find(i => i.productId === item.productId)
    if (existing) existing.quantity += item.quantity
    else items.value.push(item)
  }

  const removeItem = (productId: string) => {
    items.value = items.value.filter(i => i.productId !== productId)
  }

  const clearCart = () => { items.value = [] }

  return { items, total, addItem, removeItem, clearCart }
}, { persist: true })   // @pinia-plugin-persistedstate
```

---

## API Utility (`utils/api.ts`)

```ts
import axios from 'axios'

const api = axios.create({
  baseURL: useRuntimeConfig().public.apiBase,
  withCredentials: true,  // send httpOnly refresh cookie
})

// Silent token refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      await api.post('/auth/refresh')
      return api(err.config)
    }
    return Promise.reject(err)
  }
)

export default api
```

---

## Page Conventions

```vue
<!-- pages/products/[slug].vue -->
<script setup lang="ts">
definePageMeta({ title: 'Product Detail' })

const route = useRoute()
const { data: product, error } = await useFetch<Product>(
  `/products/${route.params.slug}`,
  { baseURL: useRuntimeConfig().public.apiBase }
)
if (!product.value) throw createError({ statusCode: 404 })
</script>

<template>
  <ProductDetail v-if="product" :product="product" />
</template>
```

---

## Component Rules

| Rule                             | Reason                              |
|----------------------------------|-------------------------------------|
| `<script setup lang="ts">`       | Always — no Options API             |
| Props typed with `defineProps<>` | Full TS inference                   |
| Emit typed with `defineEmits<>`  | No magic strings                    |
| No logic in template expressions | Extract to `computed` or composable |
| `v-if` over `v-show` for auth    | Prevents content flash              |
| Loading + error slots in every data-fetching component | UX standard |

---

## Styling

- **Tailwind CSS** is the primary styling tool.
- Global tokens (colors, spacing) live in `tailwind.config.ts`.
- Component-scoped CSS via `<style scoped>` only for micro-animations.
- Never use inline `style=""` except for dynamic values (e.g., progress bars).

### Color Palette (configure in tailwind.config.ts)

```ts
colors: {
  brand: {
    50:  '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
  surface: '#0f172a',
}
```

---

## Stripe Elements Integration

```vue
<!-- components/checkout/PaymentElement.vue -->
<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

const config = useRuntimeConfig()
const stripe = await loadStripe(config.public.stripePk)
const elements = stripe!.elements({ clientSecret: props.clientSecret })
const paymentElement = elements.create('payment')

onMounted(() => paymentElement.mount('#payment-element'))

const submit = async () => {
  const { error } = await stripe!.confirmPayment({
    elements,
    confirmParams: { return_url: `${window.location.origin}/checkout/success` },
  })
  if (error) emit('error', error.message)
}
</script>
```

---

## SEO

Use `useSeoMeta` on every page:

```ts
useSeoMeta({
  title: product.value.name,
  description: product.value.description,
  ogImage: product.value.images[0],
})
```
