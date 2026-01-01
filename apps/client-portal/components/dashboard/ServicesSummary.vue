<template>
  <div class="space-y-2">
    <!-- Services list -->
    <div
      v-for="sub in visibleSubscriptions"
      :key="sub.id"
      class="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 gap-4"
    >
      <p
        class="text-gray-900 dark:text-gray-100 text-sm truncate max-w-[60%]"
        :title="sub.service?.name"
      >
        {{ sub.service?.name || 'Услуга' }}
      </p>
      <p class="text-gray-600 dark:text-gray-400 text-sm font-medium whitespace-nowrap">
        {{ formatMoney(getPrice(sub)) }}<span class="text-gray-400 dark:text-gray-500">/мес</span>
      </p>
    </div>

    <!-- Show more button -->
    <button
      v-if="hasMore"
      class="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors py-1"
      @click="toggleExpanded"
    >
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
      {{ isExpanded ? 'Свернуть' : `Ещё ${remainingCount} ${pluralize(remainingCount, 'услуга', 'услуги', 'услуг')}` }}
    </button>

    <!-- Total -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
      <p class="text-gray-600 dark:text-gray-400 text-sm">Итого в месяц:</p>
      <p class="text-lg font-bold text-gray-900 dark:text-white">
        {{ formatMoney(totalMonthly) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMoney } from '@pg19/ui';
import type { Subscription } from '@pg19/types';

interface Props {
  subscriptions: Subscription[];
  maxVisible?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 3,
});

const isExpanded = ref(false);

const visibleSubscriptions = computed(() => {
  if (isExpanded.value || props.subscriptions.length <= props.maxVisible) {
    return props.subscriptions;
  }
  return props.subscriptions.slice(0, props.maxVisible);
});

const hasMore = computed(() => props.subscriptions.length > props.maxVisible);

const remainingCount = computed(() => props.subscriptions.length - props.maxVisible);

const totalMonthly = computed(() => {
  return props.subscriptions.reduce((sum, sub) => sum + getPrice(sub), 0);
});

function getPrice(sub: Subscription): number {
  return sub.custom_price !== null ? sub.custom_price : (sub.service?.price_monthly || 0);
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
</script>
