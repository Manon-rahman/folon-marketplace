import { useAuthStore } from '~/stores/auth'
import type { ApiResponse } from '~/types'

interface AuthResult {
  accessToken: string
  user: { id: string; email: string; name: string; role: 'user' | 'admin' }
}

export function useAuth() {
  const store = useAuthStore()
  const config = useRuntimeConfig()

  async function login(email: string, password: string) {
    const { data } = await $fetch<ApiResponse<AuthResult>>('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { email, password },
      credentials: 'include',
    })
    store.setAuth(data.accessToken, data.user)
    return data
  }

  async function register(email: string, password: string, name: string) {
    const { data } = await $fetch<ApiResponse<AuthResult>>('/auth/register', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { email, password, name },
      credentials: 'include',
    })
    store.setAuth(data.accessToken, data.user)
    return data
  }

  async function logout() {
    await $fetch('/auth/logout', {
      baseURL: config.public.apiBase,
      method: 'POST',
      credentials: 'include',
    }).catch(() => null)
    store.clearAuth()
    await navigateTo('/account/login')
  }

  return {
    user: computed(() => store.user),
    isLoggedIn: computed(() => store.isLoggedIn),
    accessToken: computed(() => store.accessToken),
    login,
    register,
    logout,
  }
}
