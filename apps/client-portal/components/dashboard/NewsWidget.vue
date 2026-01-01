<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
    <!-- Header (always visible) -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      @click="toggle"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Новости кооператива</h3>
        <span
          v-if="unreadCount > 0"
          class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-accent-pink rounded-full"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </div>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Content (collapsible) -->
    <div
      class="grid transition-all duration-300 ease-in-out"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <!-- Loading state -->
          <div v-if="isLoading" class="space-y-3 pt-4">
            <div v-for="i in 2" :key="i" class="animate-pulse p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
              <div class="flex items-center gap-2 mb-2">
                <div class="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
                <div class="h-3 w-12 bg-gray-200 dark:bg-slate-600 rounded" />
              </div>
              <div class="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
              <div class="h-3 w-1/2 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          </div>

          <!-- News list -->
          <div v-else-if="news.length > 0" class="space-y-3 pt-4">
            <NewsCard
              v-for="item in news"
              :key="item.id"
              :news="item"
              @click="openNews(item)"
            />
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
            Нет новостей
          </div>
        </div>
      </div>
    </div>

    <!-- News modal -->
    <NewsModal
      v-model:is-open="showModal"
      :news="selectedNews"
      @close="closeModal"
      @download="downloadAttachment"
    />
  </div>
</template>

<script setup lang="ts">
import type { News, NewsAttachment } from '@pg19/types';
import { useAuthStore } from '~/stores/auth';
import NewsCard from '~/components/news/NewsCard.vue';
import NewsModal from '~/components/news/NewsModal.vue';

const STORAGE_KEY = 'pg19-news-widget-expanded';
const DISPLAY_LIMIT = 5;

const api = useApi();
const authStore = useAuthStore();

const news = ref<News[]>([]);
const isLoading = ref(true);
const isExpanded = ref(true);
const showModal = ref(false);
const selectedNews = ref<News | null>(null);

const unreadCount = computed(() => news.value.filter(n => !n.is_read).length);

function toggle() {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem(STORAGE_KEY, String(isExpanded.value));
}

async function loadNews() {
  if (!authStore.user?.id) return;

  isLoading.value = true;
  try {
    news.value = await api.getNews(authStore.user.id, { limit: DISPLAY_LIMIT });
  } catch (error) {
    console.error('Failed to load news:', error);
  } finally {
    isLoading.value = false;
  }
}

async function openNews(item: News) {
  selectedNews.value = item;
  showModal.value = true;

  // Mark as read
  if (!item.is_read && authStore.user?.id) {
    try {
      await api.markNewsAsRead(item.id, authStore.user.id);
      const newsItem = news.value.find(n => n.id === item.id);
      if (newsItem) {
        newsItem.is_read = true;
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }
}

function closeModal() {
  showModal.value = false;
  selectedNews.value = null;
}

async function downloadAttachment(attachment: NewsAttachment) {
  try {
    const url = await api.getAttachmentUrl(attachment.file_path);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to download attachment:', error);
    alert('Не удалось скачать файл');
  }
}

onMounted(() => {
  // Restore expanded state (default: expanded)
  const stored = localStorage.getItem(STORAGE_KEY);
  isExpanded.value = stored !== 'false';

  loadNews();
});
</script>
