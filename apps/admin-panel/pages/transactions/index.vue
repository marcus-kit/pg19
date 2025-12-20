<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Транзакции</h1>
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
          v-model="typeFilter"
          :options="typeOptions"
          class="md:w-48"
        />
        <DateRangePicker
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          @change="loadTransactions"
        />
      </div>
    </BaseCard>

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseTable
        :columns="columns"
        :data="transactions"
        :loading="isLoading"
        row-key="id"
      >
        <template #cell-account_id="{ row }">
          <NuxtLink :to="`/accounts/${row.account_id}`" class="text-primary-500 hover:text-primary-600">
            {{ row.account_id }}
          </NuxtLink>
        </template>

        <template #cell-type="{ row }">
          <BaseBadge :variant="getTypeVariant(row.type)">
            {{ formatTransactionType(row.type) }}
          </BaseBadge>
        </template>

        <template #cell-amount="{ row }">
          <BalanceDisplay :amount="row.amount" :show-sign="true" />
        </template>

        <template #cell-balance_after="{ row }">
          <BalanceDisplay :amount="row.balance_after" />
        </template>

        <template #cell-description="{ row }">
          {{ row.description || '—' }}
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
  BaseTable,
  BaseSelect,
  BaseBadge,
  BasePagination,
  SearchInput,
  DateRangePicker,
  BalanceDisplay,
  formatDateTime,
  formatTransactionType,
} from '@pg19/ui';
import type { Transaction, TransactionType } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const transactions = ref<Transaction[]>([]);
const isLoading = ref(true);
const search = ref('');
const typeFilter = ref('');
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;

const columns = [
  { key: 'account_id', label: 'Лицевой счёт' },
  { key: 'type', label: 'Тип' },
  { key: 'amount', label: 'Сумма', align: 'right' as const },
  { key: 'balance_after', label: 'Баланс после', align: 'right' as const },
  { key: 'description', label: 'Описание' },
  { key: 'date_created', label: 'Дата' },
];

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'payment', label: 'Пополнения' },
  { value: 'charge', label: 'Списания' },
  { value: 'correction', label: 'Корректировки' },
  { value: 'refund', label: 'Возвраты' },
  { value: 'bonus', label: 'Бонусы' },
];

function getTypeVariant(type: TransactionType) {
  const variants: Record<string, 'success' | 'danger' | 'warning' | 'primary' | 'gray'> = {
    payment: 'success',
    charge: 'danger',
    correction: 'warning',
    refund: 'gray',
    bonus: 'primary',
  };
  return variants[type] || 'gray';
}

function handleSearch() {
  currentPage.value = 1;
  loadTransactions();
}

watch([currentPage, typeFilter], () => {
  loadTransactions();
});

async function loadTransactions() {
  isLoading.value = true;

  try {
    const filter: Record<string, unknown> = {};

    if (typeFilter.value) {
      filter.type = { _eq: typeFilter.value };
    }

    if (startDate.value) {
      filter.date_created = { ...filter.date_created as object, _gte: startDate.value };
    }

    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setDate(end.getDate() + 1);
      filter.date_created = { ...filter.date_created as object, _lt: end.toISOString().split('T')[0] };
    }

    const result = await api.getTransactions({
      filter,
      search: search.value || undefined,
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    transactions.value = result as unknown as Transaction[];
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
  loadTransactions();
});
</script>
