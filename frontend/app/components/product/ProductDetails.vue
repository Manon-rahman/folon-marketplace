<script setup lang="ts">
defineProps<{ description: string }>()
const open = ref<string | null>('description')

function toggle(tab: string) {
  open.value = open.value === tab ? null : tab
}
</script>

<template>
  <div class="divide-y divide-gray-200 border-y border-gray-200">
    <div v-for="tab in ['description', 'sizing', 'shipping']" :key="tab">
      <button
        class="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-900 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
        :aria-expanded="open === tab"
        @click="toggle(tab)"
      >
        <span class="capitalize">{{ tab === 'sizing' ? 'Sizing Guide' : tab === 'shipping' ? 'Shipping & Returns' : 'Description' }}</span>
        <svg
          class="w-4 h-4 transition-transform duration-200"
          :class="open === tab ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="open === tab" class="pb-4 text-sm text-gray-600 leading-relaxed">
        <template v-if="tab === 'description'">{{ description }}</template>
        <template v-else-if="tab === 'sizing'">
          <p>Our sneakers run true to size. If you're between sizes, we recommend sizing up for extra comfort. Width options may vary by style.</p>
          <table class="mt-3 w-full text-xs border-collapse">
            <thead><tr class="bg-gray-50"><th class="border border-gray-200 px-2 py-1 text-left">US</th><th class="border border-gray-200 px-2 py-1 text-left">EU</th><th class="border border-gray-200 px-2 py-1 text-left">UK</th></tr></thead>
            <tbody>
              <tr v-for="row in [['7','40','6'],['8','41','7'],['9','42','8'],['10','43','9'],['11','44','10'],['12','46','11']]" :key="row[0]">
                <td v-for="cell in row" :key="cell" class="border border-gray-200 px-2 py-1">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-else>
          <p><strong>Free standard shipping</strong> on orders over $100. Most orders arrive within 3–5 business days.</p>
          <p class="mt-2"><strong>30-day returns</strong> — unworn items in original packaging. Start a return from your account dashboard.</p>
        </template>
      </div>
    </div>
  </div>
</template>
