<template>
  <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div class="flex items-center gap-3">
      <div
        :class="[
          'flex items-center justify-center w-10 h-10 rounded-full',
          isIncome ? 'bg-green-100' : 'bg-pink-100',
        ]"
      >
        <svg
          v-if="isIncome"
          class="w-5 h-5 text-secondary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0-16l-4 4m4-4l4 4" />
        </svg>
        <svg
          v-else
          class="w-5 h-5 text-accent-pink"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20V4m0 16l4-4m-4 4l-4-4" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">
          {{ typeLabel }}
        </p>
        <p v-if="transaction.description" class="text-xs text-gray-500">
          {{ transaction.description }}
        </p>
        <p class="text-xs text-gray-400">
          {{ formattedDate }}
        </p>
      </div>
    </div>
    <div class="text-right">
      <BalanceDisplay
        :amount="transaction.amount"
        :show-sign="true"
        size="sm"
      />
      <p class="text-xs text-gray-400">
        Баланс: {{ formattedBalanceAfter }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Transaction } from '@pg19/types';
import BalanceDisplay from './BalanceDisplay.vue';
import { formatDateTime, formatMoney, formatTransactionType } from '../utils/format';

interface Props {
  transaction: Transaction;
}

const props = defineProps<Props>();

const isIncome = computed(() => props.transaction.amount > 0);

const typeLabel = computed(() => formatTransactionType(props.transaction.type));

const formattedDate = computed(() => formatDateTime(props.transaction.date_created));

const formattedBalanceAfter = computed(() => formatMoney(props.transaction.balance_after));
</script>
