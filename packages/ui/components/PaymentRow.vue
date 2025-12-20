<template>
  <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
        <svg
          class="w-5 h-5 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">
          {{ providerLabel }}
        </p>
        <p v-if="payment.external_id" class="text-xs text-gray-500">
          {{ payment.external_id }}
        </p>
        <p class="text-xs text-gray-400">
          {{ formattedDate }}
        </p>
      </div>
    </div>
    <div class="text-right">
      <BalanceDisplay :amount="payment.amount" size="sm" />
      <StatusBadge :status="payment.status" type="payment" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Payment } from '@pg19/types';
import BalanceDisplay from './BalanceDisplay.vue';
import StatusBadge from './StatusBadge.vue';
import { formatDateTime, formatPaymentProvider } from '../utils/format';

interface Props {
  payment: Payment;
}

const props = defineProps<Props>();

const providerLabel = computed(() => formatPaymentProvider(props.payment.provider));

const formattedDate = computed(() => formatDateTime(props.payment.date_created));
</script>
