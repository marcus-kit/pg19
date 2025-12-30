<template>
  <div
    class="p-3 rounded-lg border transition-all cursor-pointer"
    :class="[
      news.is_read
        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        : 'bg-primary-50 border-primary-200 hover:bg-primary-100'
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <!-- Unread indicator -->
      <div
        v-if="!news.is_read"
        class="w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <!-- Pinned icon -->
          <svg
            v-if="news.is_pinned"
            class="w-3.5 h-3.5 text-accent-pink flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>

          <NewsCategoryBadge :category="news.category" />

          <span class="text-xs text-gray-400">
            {{ formatDate(news.published_at) }}
          </span>
        </div>

        <h4 class="font-medium text-gray-900 line-clamp-1">{{ news.title }}</h4>

        <p v-if="news.summary" class="text-sm text-gray-500 line-clamp-2 mt-1">
          {{ news.summary }}
        </p>

        <!-- Attachments indicator -->
        <div
          v-if="news.attachments && news.attachments.length > 0"
          class="flex items-center gap-1 mt-2 text-xs text-gray-400"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{{ news.attachments.length }} файл(ов)</span>
        </div>
      </div>

      <!-- Arrow -->
      <svg
        class="w-5 h-5 text-gray-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { News } from '@pg19/types';
import NewsCategoryBadge from './NewsCategoryBadge.vue';

defineProps<{
  news: News;
}>();

defineEmits<{
  click: [];
}>();

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}
</script>
