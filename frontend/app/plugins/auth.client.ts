import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  if (authStore.accessToken) return

  try {
    const res = await $fetch<{
      success: true
      data: { accessToken: string; user: { id: string; email: string; name: string; role: 'user' | 'admin' } }
    }>('/auth/refresh', {
      baseURL: config.public.apiBase,
      method: 'POST',
      credentials: 'include',
    })
    authStore.setAuth(res.data.accessToken, res.data.user)
  } catch {
    // No valid refresh token — user must log in
  }
})
