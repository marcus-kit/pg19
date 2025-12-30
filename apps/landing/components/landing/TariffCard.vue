<template>
  <div
    :class="[
      'relative bg-white rounded-2xl p-6 md:p-8 transition-all duration-300',
      popular
        ? 'ring-2 ring-primary-500 shadow-xl scale-105'
        : 'border border-gray-200 hover:border-primary-300 hover:shadow-lg',
    ]"
  >
    <!-- Popular badge -->
    <div
      v-if="popular"
      class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-sm font-medium rounded-full"
    >
      Популярный
    </div>

    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-gray-900">{{ name }}</h3>
      <p v-if="description" class="text-sm text-gray-500 mt-1">
        {{ description }}
      </p>
    </div>

    <!-- Speed -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="font-semibold text-primary-700">{{ speed }}</span>
      </div>
    </div>

    <!-- Price -->
    <div class="text-center mb-6">
      <div class="flex items-baseline justify-center gap-1">
        <span class="text-4xl font-bold text-gray-900">{{ price }}</span>
        <span class="text-gray-500">₽/мес</span>
      </div>
      <p v-if="connectionPrice === 0" class="text-sm text-secondary-500 mt-1">
        Подключение бесплатно
      </p>
      <p v-else-if="connectionPrice" class="text-sm text-gray-500 mt-1">
        Подключение: {{ connectionPrice }} ₽
      </p>
    </div>

    <!-- Features -->
    <ul class="space-y-3 mb-8">
      <li
        v-for="feature in features"
        :key="feature"
        class="flex items-center gap-3 text-sm text-gray-600"
      >
        <svg class="w-5 h-5 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ feature }}
      </li>
    </ul>

    <!-- CTA -->
    <a
      href="#hero"
      :class="[
        'block w-full py-3 px-4 text-center font-medium rounded-lg transition-colors',
        popular
          ? 'bg-primary-500 hover:bg-primary-600 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      ]"
    >
      Подключить
    </a>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  price: number;
  speed: string;
  description?: string;
  features: string[];
  popular?: boolean;
  connectionPrice?: number;
}

defineProps<Props>();
</script>
