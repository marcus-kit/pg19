<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Отчёты</h1>

    <!-- Period Selector -->
    <BaseCard class="mb-6" :padding="true">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Период</label>
          <DateRangePicker
            v-model:start-date="startDate"
            v-model:end-date="endDate"
            @change="loadReports"
          />
        </div>
        <BaseButton variant="primary" :loading="isLoading" @click="loadReports">
          Сформировать отчёты
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Reports Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <!-- Revenue Report -->
      <BaseCard>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Поступления</h3>
          <div class="p-2 bg-secondary-100 rounded-lg">
            <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div class="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div v-else>
          <p class="text-3xl font-bold text-secondary-500">{{ formatMoney(reports.totalPayments) }}</p>
          <p class="text-sm text-gray-500">{{ reports.paymentCount }} платежей</p>
        </div>
      </BaseCard>

      <!-- Charges Report -->
      <BaseCard>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Списания</h3>
          <div class="p-2 bg-accent-pink/10 rounded-lg">
            <svg class="w-5 h-5 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div class="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div v-else>
          <p class="text-3xl font-bold text-accent-pink">{{ formatMoney(Math.abs(reports.totalCharges)) }}</p>
          <p class="text-sm text-gray-500">{{ reports.chargeCount }} операций</p>
        </div>
      </BaseCard>

      <!-- Balance Report -->
      <BaseCard>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Баланс операций</h3>
          <div class="p-2 bg-primary-100 rounded-lg">
            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div class="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div v-else>
          <p :class="['text-3xl font-bold', netBalance >= 0 ? 'text-secondary-500' : 'text-accent-pink']">
            {{ formatMoney(netBalance) }}
          </p>
          <p class="text-sm text-gray-500">Разница за период</p>
        </div>
      </BaseCard>
    </div>

    <!-- Debtors List -->
    <BaseCard title="Должники" class="mb-6">
      <template #header-right>
        <BaseBadge variant="danger">{{ debtors.length }}</BaseBadge>
      </template>

      <div v-if="isLoadingDebtors" class="space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div class="space-y-2">
            <div class="h-4 w-32 bg-gray-200 rounded" />
            <div class="h-3 w-48 bg-gray-200 rounded" />
          </div>
          <div class="h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      <div v-else-if="debtors.length === 0" class="text-center py-8 text-gray-500">
        Должников нет
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="debtor in debtors"
          :key="debtor.id"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <NuxtLink :to="`/accounts/${debtor.id}`" class="font-medium text-gray-900 hover:text-primary-500">
              {{ debtor.account_number }}
            </NuxtLink>
            <p class="text-sm text-gray-500">{{ debtor.address_full || formatDebtorAddress(debtor) }}</p>
          </div>
          <div class="text-right">
            <BalanceDisplay :amount="debtor.balance" />
            <StatusBadge :status="debtor.status" type="account" />
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Payment Providers Breakdown -->
    <BaseCard title="Платежи по провайдерам">
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="animate-pulse flex justify-between items-center">
          <div class="h-4 w-24 bg-gray-200 rounded" />
          <div class="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      <div v-else-if="Object.keys(reports.byProvider).length === 0" class="text-center py-8 text-gray-500">
        Нет данных за выбранный период
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(data, provider) in reports.byProvider"
          :key="provider"
          class="flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="getProviderColor(provider as string)" />
            <span class="text-gray-700">{{ formatPaymentProvider(provider as string) }}</span>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatMoney(data.total) }}</p>
            <p class="text-sm text-gray-500">{{ data.count }} платежей</p>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseButton,
  BaseBadge,
  DateRangePicker,
  BalanceDisplay,
  StatusBadge,
  formatMoney,
  formatPaymentProvider,
  formatAddress,
} from '@pg19/ui';
import type { Account } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const isLoading = ref(false);
const isLoadingDebtors = ref(true);
const debtors = ref<Account[]>([]);

interface ReportData {
  totalPayments: number;
  paymentCount: number;
  totalCharges: number;
  chargeCount: number;
  byProvider: Record<string, { total: number; count: number }>;
}

const reports = reactive<ReportData>({
  totalPayments: 0,
  paymentCount: 0,
  totalCharges: 0,
  chargeCount: 0,
  byProvider: {},
});

const netBalance = computed(() => reports.totalPayments + reports.totalCharges);

// Set default dates (current month)
onMounted(() => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  startDate.value = firstDay.toISOString().split('T')[0];
  endDate.value = now.toISOString().split('T')[0];

  loadReports();
  loadDebtors();
});

function formatDebtorAddress(account: Account): string {
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    yookassa: 'bg-blue-500',
    cloudpayments: 'bg-purple-500',
    sbp: 'bg-green-500',
    cash: 'bg-yellow-500',
    bank_transfer: 'bg-indigo-500',
    terminal: 'bg-gray-500',
  };
  return colors[provider] || 'bg-gray-400';
}

async function loadReports() {
  if (!startDate.value || !endDate.value) return;

  isLoading.value = true;

  try {
    // Load payments for the period
    const payments = await api.getPayments({
      filter: {
        status: { _eq: 'succeeded' },
        date_created: {
          _gte: startDate.value,
          _lte: endDate.value + 'T23:59:59',
        },
      },
      limit: -1,
    });

    // Calculate totals
    reports.totalPayments = 0;
    reports.paymentCount = 0;
    reports.byProvider = {};

    for (const payment of payments) {
      reports.totalPayments += payment.amount;
      reports.paymentCount++;

      const provider = payment.provider || 'unknown';
      if (!reports.byProvider[provider]) {
        reports.byProvider[provider] = { total: 0, count: 0 };
      }
      reports.byProvider[provider].total += payment.amount;
      reports.byProvider[provider].count++;
    }

    // Load charges (negative transactions) for the period
    const charges = await api.getTransactions({
      filter: {
        type: { _eq: 'charge' },
        date_created: {
          _gte: startDate.value,
          _lte: endDate.value + 'T23:59:59',
        },
      },
      limit: -1,
    });

    reports.totalCharges = 0;
    reports.chargeCount = charges.length;

    for (const charge of charges) {
      reports.totalCharges += charge.amount; // Already negative
    }
  } catch (e) {
    console.error('Failed to load reports:', e);
  } finally {
    isLoading.value = false;
  }
}

async function loadDebtors() {
  isLoadingDebtors.value = true;

  try {
    const accounts = await api.getAccounts({
      filter: {
        balance: { _lt: 0 },
        status: { _neq: 'closed' },
      },
      sort: ['balance'],
      limit: 50,
    });

    debtors.value = accounts as unknown as Account[];
  } catch (e) {
    console.error('Failed to load debtors:', e);
  } finally {
    isLoadingDebtors.value = false;
  }
}
</script>
