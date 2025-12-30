<template>
  <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div
      :class="[
        'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
        iconBgClass,
      ]"
    >
      <!-- Speed icon -->
      <svg v-if="icon === 'speed'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>

      <!-- Support icon -->
      <svg v-else-if="icon === 'support'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>

      <!-- Price icon -->
      <svg v-else-if="icon === 'price'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <!-- Quality icon -->
      <svg v-else-if="icon === 'quality'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    </div>

    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-600 text-sm">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: 'speed' | 'support' | 'price' | 'quality';
  title: string;
  description: string;
}

const props = defineProps<Props>();

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    speed: 'bg-primary-100',
    support: 'bg-secondary-100',
    price: 'bg-orange-100',
    quality: 'bg-purple-100',
  };
  return classes[props.icon] || 'bg-gray-100';
});

const iconClass = computed(() => {
  const classes: Record<string, string> = {
    speed: 'text-primary-500',
    support: 'text-secondary-500',
    price: 'text-accent-orange',
    quality: 'text-purple-500',
  };
  return classes[props.icon] || 'text-gray-500';
});
</script>
