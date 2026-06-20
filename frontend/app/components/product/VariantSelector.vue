<script setup lang="ts">
const props = defineProps<{
  sizes: string[]
  outOfStock?: string[]
}>()

const selected = defineModel<string>()

if (!selected.value && props.sizes.length) {
  const first = props.sizes.find((s) => !props.outOfStock?.includes(s))
  if (first) selected.value = first
}
</script>

<template>
  <div>
    <p class="text-sm font-medium text-gray-700 mb-2">
      Size <span v-if="selected" class="font-bold text-gray-900">— {{ selected }}</span>
    </p>
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
      <button
        v-for="size in sizes"
        :key="size"
        role="radio"
        :aria-checked="selected === size"
        :aria-disabled="outOfStock?.includes(size)"
        :disabled="outOfStock?.includes(size)"
        :class="[
          'px-4 py-2 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500',
          selected === size
            ? 'border-brand-600 bg-brand-50 text-brand-700'
            : 'border-gray-200 text-gray-700 hover:border-gray-400',
          outOfStock?.includes(size) && 'opacity-40 cursor-not-allowed line-through',
        ]"
        @click="selected = size"
      >
        {{ size }}
      </button>
    </div>
  </div>
</template>
