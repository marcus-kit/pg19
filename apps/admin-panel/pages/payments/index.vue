<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Платежи</h1>
      <NuxtLink to="/payments/create">
        <BaseButton variant="primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Создать платёж
        </BaseButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <BaseCard class="mb-6" :padding="true">
      <div class="flex flex-col md:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Поиск по номеру счёта..."
          class="flex-1"
          @search="handleSearch"
        />
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          class="md:w-48"
        />
        <BaseSelect
          v-model="providerFilter"
          :options="providerOptions"
          class="md:w-48"
        />
      </div>
    </BaseCard>

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseTable
        :columns="columns"
        :data="payments"
        :loading="isLoading"
        row-key="id"
      >
        <template #cell-account_id="{ row }">
          <NuxtLink :to="`/accounts/${row.account_id}`" class="text-primary-500 hover:text-primary-600">
            {{ row.account_id }}
          </NuxtLink>
        </template>

        <template #cell-amount="{ row }">
          <BalanceDisplay :amount="row.amount" />
        </template>

        <template #cell-provider="{ row }">
          {{ formatPaymentProvider(row.provider) }}
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" type="payment" />
        </template>

        <template #cell-date_created="{ row }">
          {{ formatDateTime(row.date_created) }}
        </template>
      </BaseTable>

      <BasePagination
        v-if="total > perPage"
        v-model:current-page="currentPage"
        :total="total"
        :per-page="perPage"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseButton,
  BaseTable,
  BaseSelect,
  BasePagination,
  SearchInput,
  BalanceDisplay,
  StatusBadge,
  formatDateTime,
  formatPaymentProvider,
} from '@pg19/ui';
import type { Payment } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const payments = ref<Payment[]>([]);
const isLoading = ref(true);
const search = ref('');
const statusFilter = ref('');
const providerFilter = ref('');
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;

const columns = [
  { key: 'account_id', label: 'Лицевой счёт' },
  { key: 'amount', label: 'Сумма', align: 'right' as const },
  { key: 'provider', label: 'Провайдер' },
  { key: 'status', label: 'Статус' },
  { key: 'date_created', label: 'Дата' },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'succeeded', label: 'Успешно' },
  { value: 'failed', label: 'Ошибка' },
  { value: 'refunded', label: 'Возвращён' },
];

const providerOptions = [
  { value: '', label: 'Все провайдеры' },
  { value: 'yookassa', label: 'ЮКасса' },
  { value: 'cloudpayments', label: 'CloudPayments' },
  { value: 'sbp', label: 'СБП' },
  { value: 'cash', label: 'Наличные' },
  { value: 'bank_transfer', label: 'Банковский перевод' },
  { value: 'terminal', label: 'Терминал' },
];

function handleSearch() {
  currentPage.value = 1;
  loadPayments();
}

watch([currentPage, statusFilter, providerFilter], () => {
  loadPayments();
});

async function loadPayments() {
  isLoading.value = true;

  try {
    const filter: Record<string, unknown> = {};

    if (statusFilter.value) {
      filter.status = { _eq: statusFilter.value };
    }

    if (providerFilter.value) {
      filter.provider = { _eq: providerFilter.value };
    }

    const result = await api.getPayments({
      filter,
      search: search.value || undefined,
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    payments.value = result as unknown as Payment[];
    total.value = payments.value.length < perPage
      ? (currentPage.value - 1) * perPage + payments.value.length
      : currentPage.value * perPage + 1;
  } catch (e) {
    console.error('Failed to load payments:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadPayments();
});
</script>
