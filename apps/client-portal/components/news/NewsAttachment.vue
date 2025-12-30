<template>
  <button
    type="button"
    class="flex items-center gap-2 p-2 w-full rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
    :disabled="isLoading"
    @click="handleDownload"
  >
    <div class="flex-shrink-0">
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 truncate">
        {{ attachment.file_name }}
      </p>
      <p v-if="attachment.file_size" class="text-xs text-gray-500">
        {{ formatFileSize(attachment.file_size) }}
      </p>
    </div>
    <div class="flex-shrink-0">
      <svg
        v-if="isLoading"
        class="w-4 h-4 text-gray-400 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <svg
        v-else
        class="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { NewsAttachment } from '@pg19/types';

const props = defineProps<{
  attachment: NewsAttachment;
}>();

const emit = defineEmits<{
  download: [attachment: NewsAttachment];
}>();

const isLoading = ref(false);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

async function handleDownload() {
  isLoading.value = true;
  try {
    emit('download', props.attachment);
  } finally {
    isLoading.value = false;
  }
}
</script>
