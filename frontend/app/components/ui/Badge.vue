<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'warning' | 'error' | 'neutral'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-green-100 text-green-800': (variant ?? 'success') === 'success',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-red-100 text-red-800': variant === 'error',
        'bg-gray-100 text-gray-700': variant === 'neutral',
      },
    ]"
  >
    <slot />
  </span>
</template>
