<template>
  <div v-if="payment" class="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
    <div class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800/50 flex items-center justify-center flex-shrink-0">
      <svg class="w-5 h-5 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-600 dark:text-gray-400">Последний платёж</p>
      <p class="font-semibold text-gray-900 dark:text-white">
        {{ formatMoney(payment.amount) }}
      </p>
    </div>
    <div class="text-right">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ formatDate(payment.date_created) }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500">
        {{ relativeTime }}
      </p>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else-if="isLoading" class="animate-pulse flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
    <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600" />
    <div class="flex-1 space-y-2">
      <div class="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
      <div class="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
    </div>
  </div>

  <!-- No payment -->
  <div v-else class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400">Платежей пока нет</p>
  </div>
</template>

<script setup lang="ts">
import { formatMoney, formatDate } from '@pg19/ui';
import type { Transaction } from '@pg19/types';

interface Props {
  payment: Transaction | null;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const relativeTime = computed(() => {
  if (!props.payment?.date_created) return '';

  const date = new Date(props.payment.date_created);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} ${pluralizeDays(diffDays)} назад`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${pluralizeWeeks(weeks)} назад`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${pluralizeMonths(months)} назад`;
  }
  return '';
});

function pluralizeDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

function pluralizeWeeks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'недель';
  if (mod10 === 1) return 'неделю';
  if (mod10 >= 2 && mod10 <= 4) return 'недели';
  return 'недель';
}

function pluralizeMonths(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'месяцев';
  if (mod10 === 1) return 'месяц';
  if (mod10 >= 2 && mod10 <= 4) return 'месяца';
  return 'месяцев';
}
</script>
