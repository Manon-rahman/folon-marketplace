<script setup lang="ts">
const props = defineProps<{ images: string[]; name: string }>()
const active = ref(0)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="aspect-square rounded-xl overflow-hidden bg-gray-50">
      <img
        :src="props.images[active] ?? ''"
        :alt="props.name"
        class="w-full h-full object-cover"
      />
    </div>
    <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1" role="list" :aria-label="`${name} thumbnails`">
      <button
        v-for="(img, i) in images"
        :key="i"
        role="listitem"
        :aria-label="`View image ${i + 1}`"
        :aria-pressed="active === i"
        :class="[
          'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500',
          active === i ? 'border-brand-600' : 'border-transparent hover:border-gray-300',
        ]"
        @click="active = i"
      >
        <img :src="img" :alt="`${name} view ${i + 1}`" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>
