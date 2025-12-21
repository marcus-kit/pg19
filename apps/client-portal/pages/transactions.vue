<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">История операций</h1>
      <BaseButton variant="outline" size="sm" @click="exportTransactions">
        <DownloadIcon class="w-4 h-4 mr-2" />
        Экспорт
      </BaseButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <BaseCard class="bg-secondary-50 border-secondary-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
            <ArrowDownIcon class="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <p class="text-sm text-secondary-600">Пополнения</p>
            <p class="text-lg font-bold text-secondary-700">+{{ formatMoney(stats.income) }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="bg-red-50 border-red-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <ArrowUpIcon class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-red-600">Списания</p>
            <p class="text-lg font-bold text-red-700">-{{ formatMoney(stats.expenses) }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="bg-gray-50 border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <ChartIcon class="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Операций</p>
            <p class="text-lg font-bold text-gray-700">{{ stats.count }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Filters -->
    <BaseCard class="mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Тип операции</label>
          <BaseSelect
            v-model="filter.type"
            :options="typeOptions"
            placeholder="Все типы"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Период</label>
          <div class="flex gap-2">
            <input
              v-model="filter.startDate"
              type="date"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="loadTransactions"
            />
            <span class="flex items-center text-gray-400">—</span>
            <input
              v-model="filter.endDate"
              type="date"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="loadTransactions"
            />
          </div>
        </div>
        <div class="flex items-end">
          <BaseButton variant="ghost" size="sm" @click="resetFilters">
            Сбросить
          </BaseButton>
        </div>
      </div>

      <!-- Quick Period Buttons -->
      <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          v-for="period in quickPeriods"
          :key="period.id"
          type="button"
          class="px-3 py-1.5 text-sm rounded-full transition-colors"
          :class="activePeriod === period.id
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="setQuickPeriod(period)"
        >
          {{ period.label }}
        </button>
      </div>
    </BaseCard>

    <!-- Transactions List -->
    <BaseCard :padding="false">
      <div v-if="isLoading" class="p-6 space-y-4">
        <div v-for="i in 10" :key="i" class="animate-pulse flex justify-between py-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full" />
            <div class="space-y-2">
              <div class="h-4 w-32 bg-gray-200 rounded" />
              <div class="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div class="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      <div v-else-if="transactions.length === 0" class="text-center py-16">
        <HistoryIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500 text-lg">Операции не найдены</p>
        <p class="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
      </div>

      <div v-else>
        <!-- Grouped by date -->
        <div
          v-for="(group, date) in groupedTransactions"
          :key="date"
          class="border-b border-gray-100 last:border-0"
        >
          <div class="px-6 py-3 bg-gray-50 sticky top-0">
            <p class="text-sm font-medium text-gray-500">{{ formatGroupDate(date) }}</p>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="tx in group"
              :key="tx.id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="getTransactionIconBg(tx.type)"
                  >
                    <component
                      :is="getTransactionIcon(tx.type)"
                      class="w-5 h-5"
                      :class="getTransactionIconColor(tx.type)"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ getTransactionLabel(tx.type) }}</p>
                    <p v-if="tx.description" class="text-sm text-gray-500">{{ tx.description }}</p>
                    <p class="text-xs text-gray-400">{{ formatTime(tx.date_created) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    class="text-lg font-semibold"
                    :class="tx.amount >= 0 ? 'text-secondary-600' : 'text-gray-900'"
                  >
                    {{ tx.amount >= 0 ? '+' : '' }}{{ formatMoney(tx.amount) }}
                  </p>
                  <p class="text-xs text-gray-400">
                    Баланс: {{ formatMoney(tx.balance_after) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && total > perPage" class="p-4 border-t border-gray-100">
        <BasePagination
          v-model:current-page="currentPage"
          :total="total"
          :per-page="perPage"
        />
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseSelect, BaseButton, BasePagination, formatMoney } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Transaction, TransactionType } from '@pg19/types';

// Icons
import DownloadIcon from '~/components/icons/DownloadIcon.vue';
import ArrowDownIcon from '~/components/icons/ArrowDownIcon.vue';
import ArrowUpIcon from '~/components/icons/ArrowUpIcon.vue';
import ChartIcon from '~/components/icons/ChartIcon.vue';
import HistoryIcon from '~/components/icons/HistoryIcon.vue';
import PaymentIcon from '~/components/icons/PaymentIcon.vue';
import ChargeIcon from '~/components/icons/ChargeIcon.vue';
import RefundIcon from '~/components/icons/RefundIcon.vue';
import BonusIcon from '~/components/icons/BonusIcon.vue';
import CorrectionIcon from '~/components/icons/CorrectionIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

const transactions = ref<Transaction[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;
const activePeriod = ref('month');

const filter = reactive({
  type: '',
  startDate: null as string | null,
  endDate: null as string | null,
});

const stats = computed(() => {
  let income = 0;
  let expenses = 0;

  transactions.value.forEach(tx => {
    if (tx.amount > 0) {
      income += tx.amount;
    } else {
      expenses += Math.abs(tx.amount);
    }
  });

  return {
    income,
    expenses,
    count: transactions.value.length,
  };
});

const groupedTransactions = computed(() => {
  const groups: Record<string, Transaction[]> = {};

  transactions.value.forEach(tx => {
    const date = tx.date_created.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
  });

  return groups;
});

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'payment', label: 'Пополнения' },
  { value: 'charge', label: 'Списания' },
  { value: 'correction', label: 'Корректировки' },
  { value: 'refund', label: 'Возвраты' },
  { value: 'bonus', label: 'Бонусы' },
];

const quickPeriods = [
  { id: 'week', label: 'Неделя', days: 7 },
  { id: 'month', label: 'Месяц', days: 30 },
  { id: '3months', label: '3 месяца', days: 90 },
  { id: 'year', label: 'Год', days: 365 },
  { id: 'all', label: 'Всё время', days: 0 },
];

watch([() => filter.type, currentPage], () => {
  loadTransactions();
});

function setQuickPeriod(period: { id: string; days: number }) {
  activePeriod.value = period.id;

  if (period.days === 0) {
    filter.startDate = null;
    filter.endDate = null;
  } else {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - period.days);

    filter.startDate = start.toISOString().split('T')[0];
    filter.endDate = end.toISOString().split('T')[0];
  }

  loadTransactions();
}

function resetFilters() {
  filter.type = '';
  filter.startDate = null;
  filter.endDate = null;
  activePeriod.value = '';
  currentPage.value = 1;
  loadTransactions();
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    payment: 'Пополнение',
    charge: 'Списание',
    correction: 'Корректировка',
    refund: 'Возврат',
    bonus: 'Бонус',
  };
  return labels[type] || type;
}

function getTransactionIcon(type: TransactionType) {
  const icons: Record<TransactionType, any> = {
    payment: PaymentIcon,
    charge: ChargeIcon,
    correction: CorrectionIcon,
    refund: RefundIcon,
    bonus: BonusIcon,
  };
  return icons[type] || PaymentIcon;
}

function getTransactionIconBg(type: TransactionType): string {
  const bgs: Record<TransactionType, string> = {
    payment: 'bg-secondary-100',
    charge: 'bg-gray-100',
    correction: 'bg-blue-100',
    refund: 'bg-orange-100',
    bonus: 'bg-purple-100',
  };
  return bgs[type] || 'bg-gray-100';
}

function getTransactionIconColor(type: TransactionType): string {
  const colors: Record<TransactionType, string> = {
    payment: 'text-secondary-600',
    charge: 'text-gray-600',
    correction: 'text-blue-600',
    refund: 'text-orange-600',
    bonus: 'text-purple-600',
  };
  return colors[type] || 'text-gray-600';
}

function exportTransactions() {
  // Placeholder for export functionality
  alert('Экспорт будет доступен в ближайшее время');
}

async function loadTransactions() {
  const accountId = authStore.primaryAccount?.id;
  if (!accountId) return;

  isLoading.value = true;

  try {
    const queryFilter: Record<string, unknown> = {
      account_id: { _eq: accountId },
    };

    if (filter.type) {
      queryFilter.type = { _eq: filter.type };
    }

    if (filter.startDate) {
      queryFilter.date_created = { ...queryFilter.date_created as object, _gte: filter.startDate };
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setDate(endDate.getDate() + 1);
      queryFilter.date_created = { ...queryFilter.date_created as object, _lt: endDate.toISOString().split('T')[0] };
    }

    const result = await api.getTransactions({
      filter: queryFilter,
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    transactions.value = result as Transaction[];
    total.value = transactions.value.length < perPage
      ? (currentPage.value - 1) * perPage + transactions.value.length
      : currentPage.value * perPage + 1;
  } catch (e) {
    console.error('Failed to load transactions:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // Default to last month
  setQuickPeriod(quickPeriods[1]);
});
</script>
