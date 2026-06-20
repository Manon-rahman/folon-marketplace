export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  ssr: true,
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    apiBase: process.env.API_BASE ?? 'http://localhost:4000/api',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api',
      stripePk: process.env.NUXT_PUBLIC_STRIPE_PK ?? '',
    },
  },
  typescript: { strict: true },
  app: {
    head: {
      titleTemplate: '%s — Sole District',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Premium sneakers, curated for every stride.' },
      ],
    },
  },
})
