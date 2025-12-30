<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50" @click="close" />

        <!-- Modal -->
        <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <Transition
            enter-active-class="transition-all duration-200"
            leave-active-class="transition-all duration-200"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="isOpen && news"
              class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform"
            >
              <!-- Header -->
              <div class="flex items-start justify-between p-4 border-b">
                <div class="flex-1 pr-8">
                  <div class="flex items-center gap-2 mb-2">
                    <NewsCategoryBadge :category="news.category" />
                    <span class="text-xs text-gray-400">
                      {{ formatDate(news.published_at) }}
                    </span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ news.title }}
                  </h2>
                </div>
                <button
                  type="button"
                  class="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  @click="close"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div class="p-4 max-h-[60vh] overflow-y-auto">
                <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {{ news.content }}
                </div>

                <!-- Attachments -->
                <div v-if="news.attachments && news.attachments.length > 0" class="mt-6 pt-4 border-t">
                  <h5 class="text-sm font-medium text-gray-900 mb-3">
                    Прикреплённые файлы
                  </h5>
                  <div class="space-y-2">
                    <NewsAttachment
                      v-for="attachment in news.attachments"
                      :key="attachment.id"
                      :attachment="attachment"
                      @download="handleDownload"
                    />
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-4 border-t bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  class="w-full px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                  @click="close"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { News, NewsAttachment as NewsAttachmentType } from '@pg19/types';
import NewsCategoryBadge from './NewsCategoryBadge.vue';
import NewsAttachment from './NewsAttachment.vue';

const props = defineProps<{
  isOpen: boolean;
  news: News | null;
}>();

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  close: [];
  download: [attachment: NewsAttachmentType];
}>();

function close() {
  emit('update:isOpen', false);
  emit('close');
}

function handleDownload(attachment: NewsAttachmentType) {
  emit('download', attachment);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close();
    }
  };
  document.addEventListener('keydown', handleEscape);
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});
</script>
