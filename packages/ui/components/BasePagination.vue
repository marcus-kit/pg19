<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
    aria-label="Навигация по страницам"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700">
        Показано
        <span class="font-medium">{{ startItem }}</span>
        —
        <span class="font-medium">{{ endItem }}</span>
        из
        <span class="font-medium">{{ total }}</span>
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end gap-2">
      <button
        type="button"
        :disabled="currentPage <= 1"
        class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(currentPage - 1)"
      >
        Назад
      </button>

      <div class="hidden sm:flex gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :class="[
            'relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg',
            page === currentPage
              ? 'bg-primary-500 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
          ]"
          @click="typeof page === 'number' && goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(currentPage + 1)"
      >
        Вперёд
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  total: number;
  perPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 20,
});

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

const totalPages = computed(() => Math.ceil(props.total / props.perPage));

const startItem = computed(() => (props.currentPage - 1) * props.perPage + 1);

const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.total));

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
  }

  return pages;
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page);
  }
}
</script>
