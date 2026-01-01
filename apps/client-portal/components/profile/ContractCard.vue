<template>
  <BaseCard title="Договор">
    <dl class="space-y-4">
      <!-- Contract Number with Copy -->
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <div>
          <dt class="text-sm text-gray-500 dark:text-gray-400">Номер договора</dt>
          <dd class="flex items-center gap-2">
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ contractNumber }}
            </span>
            <button
              class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Скопировать номер договора"
              @click="copyContractNumber"
            >
              <ClipboardIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          </dd>
        </div>
        <StatusBadge :status="contractStatus" type="contract" />
      </div>

      <!-- Start Date -->
      <div v-if="startDate">
        <dt class="text-sm text-gray-500 dark:text-gray-400">Дата заключения</dt>
        <dd class="text-gray-900 dark:text-white">{{ formatDate(startDate) }}</dd>
      </div>

      <!-- Address -->
      <div v-if="address">
        <dt class="text-sm text-gray-500 dark:text-gray-400">Адрес по договору</dt>
        <dd class="text-gray-900 dark:text-white">{{ address }}</dd>
      </div>

      <!-- Download PDF -->
      <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          class="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isDownloading"
          @click="$emit('download-pdf')"
        >
          <template v-if="isDownloading">
            <LoadingSpinner class="w-4 h-4 inline mr-1" />
            Загрузка...
          </template>
          <template v-else>
            <DocumentIcon class="w-4 h-4 inline mr-1" />
            Скачать договор (PDF)
          </template>
        </button>
      </div>
    </dl>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard, StatusBadge, formatDate } from '@pg19/ui';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import ClipboardIcon from '~/components/icons/ClipboardIcon.vue';
import LoadingSpinner from '~/components/icons/LoadingSpinner.vue';

interface Props {
  contractNumber: string | number;
  contractStatus: string;
  startDate?: string | null;
  address?: string | null;
  isDownloading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'download-pdf': [];
  'copy-success': [];
  'copy-error': [];
}>();

async function copyContractNumber() {
  try {
    await navigator.clipboard.writeText(String(props.contractNumber));
    emit('copy-success');
  } catch {
    emit('copy-error');
  }
}
</script>
