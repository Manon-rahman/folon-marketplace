<script setup lang="ts">
const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  visible: boolean
}>()
const emit = defineEmits<{ close: [] }>()

watch(() => props.visible, (v) => {
  if (v) setTimeout(() => emit('close'), 4000)
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 translate-y-2"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="visible"
      role="alert"
      aria-live="assertive"
      :class="[
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm font-medium',
        {
          'bg-green-600 text-white': (type ?? 'info') === 'success',
          'bg-red-600 text-white': type === 'error',
          'bg-gray-900 text-white': type === 'info',
        },
      ]"
    >
      <span>{{ message }}</span>
      <button class="ml-auto opacity-75 hover:opacity-100" aria-label="Dismiss" @click="emit('close')">✕</button>
    </div>
  </Transition>
</template>
