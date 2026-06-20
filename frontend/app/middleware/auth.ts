import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  // Token lives in memory — only check on client after the auth plugin has restored it
  if (import.meta.server) return

  const store = useAuthStore()
  if (!store.isLoggedIn) {
    return navigateTo('/account/login')
  }
})
