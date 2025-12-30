<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    {{ categoryLabel }}
  </span>
</template>

<script setup lang="ts">
import type { NewsCategory } from '@pg19/types';

const props = defineProps<{
  category: NewsCategory;
}>();

const categoryConfig: Record<NewsCategory, { label: string; classes: string }> = {
  announcement: {
    label: 'Объявление',
    classes: 'bg-blue-100 text-blue-800',
  },
  protocol: {
    label: 'Протокол',
    classes: 'bg-purple-100 text-purple-800',
  },
  notification: {
    label: 'Уведомление',
    classes: 'bg-amber-100 text-amber-800',
  },
};

const badgeClasses = computed(() => categoryConfig[props.category].classes);
const categoryLabel = computed(() => categoryConfig[props.category].label);
</script>
