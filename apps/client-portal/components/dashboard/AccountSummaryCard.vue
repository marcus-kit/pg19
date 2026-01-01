<template>
  <div class="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Balance + Status -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
          <WalletIcon class="w-7 h-7 text-primary-600 dark:text-primary-300" />
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Ваш баланс</p>
          <BalanceDisplay :amount="balance" size="xl" />
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge :status="status" type="account" />
            <span class="text-xs text-gray-500 dark:text-gray-400">Договор #{{ contractNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Days Remaining + Pay Button -->
      <div class="flex items-center gap-4 sm:gap-6">
        <div v-if="daysRemaining !== null" class="text-center sm:text-right">
          <p class="text-2xl font-bold" :class="daysClass">
            {{ daysRemaining }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">дней хватит</p>
        </div>
        <NuxtLink to="/payment">
          <BaseButton
            :variant="hasOverdue ? 'primary' : 'outline'"
            :size="hasOverdue ? 'lg' : 'md'"
            class="whitespace-nowrap"
          >
            <WalletIcon class="w-5 h-5 mr-2" />
            {{ hasOverdue ? 'Оплатить' : 'Пополнить' }}
            <span
              v-if="unpaidCount > 0"
              class="ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full"
              :class="hasOverdue ? 'bg-white/20 text-white' : 'bg-accent-pink text-white'"
            >
              {{ unpaidCount }}
            </span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BalanceDisplay, StatusBadge, BaseButton } from '@pg19/ui';
import WalletIcon from '~/components/icons/WalletIcon.vue';

interface Props {
  balance: number;
  status: string;
  contractNumber: string;
  daysRemaining: number | null;
  unpaidCount: number;
  hasOverdue: boolean;
}

const props = defineProps<Props>();

const daysClass = computed(() => {
  if (props.daysRemaining === null) return '';
  if (props.daysRemaining < 7) return 'text-accent-pink';
  if (props.daysRemaining < 14) return 'text-accent-orange';
  return 'text-secondary-600';
});
</script>
