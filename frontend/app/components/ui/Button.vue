<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800': (variant ?? 'primary') === 'primary',
        'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300': variant === 'secondary',
        'border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'outline',
        'text-gray-700 hover:bg-gray-100': variant === 'ghost',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-sm': (size ?? 'md') === 'md',
        'px-6 py-3 text-base': size === 'lg',
      },
    ]"
  >
    <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
