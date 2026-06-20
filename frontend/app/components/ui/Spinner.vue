<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <svg
    :class="[
      'animate-spin text-brand-600',
      { 'w-4 h-4': size === 'sm', 'w-6 h-6': (size ?? 'md') === 'md', 'w-8 h-8': size === 'lg' },
    ]"
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Loading"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
</template>
