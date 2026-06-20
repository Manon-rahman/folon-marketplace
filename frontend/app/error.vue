<script setup lang="ts">
defineProps<{ error: { statusCode: number; message: string } }>()
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p class="text-8xl font-extrabold text-brand-100 mb-4">{{ error.statusCode }}</p>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="text-gray-500 mb-8 max-w-md">
        {{ error.statusCode === 404
          ? "We couldn't find what you were looking for. The product may have been removed or the URL is incorrect."
          : error.message ?? 'An unexpected error occurred.' }}
      </p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        ← Back to Shop
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>
