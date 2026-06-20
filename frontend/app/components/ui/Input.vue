<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5" aria-hidden="true">*</span>
    </label>
    <input
      v-model="modelValue"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :class="[
        'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors',
        error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300',
      ]"
    />
    <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>
  </div>
</template>
