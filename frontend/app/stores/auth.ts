import { defineStore } from 'pinia'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  function setAuth(token: string, u: AuthUser) {
    accessToken.value = token
    user.value = u
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  return { accessToken, user, isLoggedIn, setAuth, clearAuth }
})
