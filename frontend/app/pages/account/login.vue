<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

useSeoMeta({ title: 'Sign In' })

const { login, register, isLoggedIn } = useAuth()
if (isLoggedIn.value) await navigateTo('/account')

const mode = ref<'login' | 'register'>('login')
const form = reactive({ email: '', password: '', name: '' })
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    if (mode.value === 'login') {
      await login(form.email, form.password)
    } else {
      await register(form.email, form.password, form.name)
    }
    await navigateTo('/account')
  } catch (e: unknown) {
    const err = e as { data?: { error?: { message?: string } } }
    error.value = err?.data?.error?.message ?? 'Authentication failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <h1 class="text-2xl font-extrabold text-gray-900 mb-2 text-center">
        {{ mode === 'login' ? 'Welcome back' : 'Create account' }}
      </h1>
      <p class="text-sm text-gray-500 text-center mb-8">
        {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
        <button class="text-brand-600 font-medium hover:text-brand-700 ml-1" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
        </button>
      </p>

      <form class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
          {{ error }}
        </div>

        <UiInput
          v-if="mode === 'register'"
          v-model="form.name"
          label="Full Name"
          autocomplete="name"
          :required="true"
        />
        <UiInput
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          :required="true"
        />
        <UiInput
          v-model="form.password"
          label="Password"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          :required="true"
        />

        <UiButton type="submit" size="lg" class="w-full mt-1" :loading="loading">
          {{ mode === 'login' ? 'Sign In' : 'Create Account' }}
        </UiButton>
      </form>
    </div>
  </div>
</template>
