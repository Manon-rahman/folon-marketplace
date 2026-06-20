import axios from 'axios'

const api = axios.create({
  withCredentials: true,
})

// Attach baseURL at runtime (avoids SSR/CSR mismatch with runtimeConfig)
if (typeof window !== 'undefined') {
  api.defaults.baseURL = window.__nuxt_runtime_config__?.public?.apiBase ?? '/api'
}

let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as (typeof err.config & { _retry?: boolean })
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').then(() => { refreshPromise = null }).catch(() => { refreshPromise = null })
      }
      try {
        await refreshPromise
        return api(original)
      } catch {
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  },
)

export default api

declare global {
  interface Window {
    __nuxt_runtime_config__?: { public?: { apiBase?: string } }
  }
}
