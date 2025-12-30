<template>
  <div v-if="news.length > 0 || isLoading" class="mb-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900">Новости кооператива</h3>
          <span
            v-if="unreadCount > 0"
            class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-accent-pink rounded-full"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <!-- Loading state -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 2" :key="i" class="animate-pulse p-3 rounded-lg bg-gray-50">
            <div class="flex items-center gap-2 mb-2">
              <div class="h-4 w-16 bg-gray-200 rounded" />
              <div class="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div class="h-4 w-3/4 bg-gray-200 rounded mb-2" />
            <div class="h-3 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>

        <!-- News list -->
        <div v-else class="space-y-3">
          <NewsCard
            v-for="item in displayedNews"
            :key="item.id"
            :news="item"
            @click="openNews(item)"
          />

          <!-- Empty state -->
          <div v-if="news.length === 0" class="text-center py-6 text-gray-500">
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
import NewsCard from './NewsCard.vue';
import NewsModal from './NewsModal.vue';

const api = useApi();
const authStore = useAuthStore();

const news = ref<News[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const selectedNews = ref<News | null>(null);

const unreadCount = computed(() => news.value.filter(n => !n.is_read).length);
const displayedNews = computed(() => news.value.slice(0, 5));

async function loadNews() {
  if (!authStore.person?.id) return;

  isLoading.value = true;
  try {
    news.value = await api.getNews(authStore.person.id, { limit: 10 });
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
  if (!item.is_read && authStore.person?.id) {
    try {
      await api.markNewsAsRead(item.id, authStore.person.id);
      // Update local state
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
    // Open in new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to download attachment:', error);
    alert('Не удалось скачать файл');
  }
}

onMounted(() => {
  loadNews();
});
</script>
