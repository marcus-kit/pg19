<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Операции</h1>

    <!-- Filters -->
    <BaseCard class="mb-6" :padding="true">
      <div class="flex flex-col md:flex-row gap-4">
        <BaseSelect
          v-model="filter.type"
          :options="typeOptions"
          placeholder="Все типы"
          class="md:w-48"
        />
        <DateRangePicker
          v-model:start-date="filter.startDate"
          v-model:end-date="filter.endDate"
          @change="loadTransactions"
        />
      </div>
    </BaseCard>

    <!-- Transactions List -->
    <BaseCard>
      <div v-if="isLoading" class="space-y-4">
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

      <div v-else-if="transactions.length === 0" class="text-center py-12 text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Операции не найдены</p>
      </div>

      <div v-else>
        <TransactionRow
          v-for="tx in transactions"
          :key="tx.id"
          :transaction="tx"
        />
      </div>

      <BasePagination
        v-if="total > perPage"
        v-model:current-page="currentPage"
        :total="total"
        :per-page="perPage"
        class="mt-4"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseSelect, DateRangePicker, TransactionRow, BasePagination } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Transaction, TransactionType } from '@pg19/types';

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

const filter = reactive({
  type: '',
  startDate: null as string | null,
  endDate: null as string | null,
});

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'payment', label: 'Пополнения' },
  { value: 'charge', label: 'Списания' },
  { value: 'correction', label: 'Корректировки' },
  { value: 'refund', label: 'Возвраты' },
  { value: 'bonus', label: 'Бонусы' },
];

watch([() => filter.type, currentPage], () => {
  loadTransactions();
});

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

    transactions.value = result as unknown as Transaction[];
    // Note: Directus doesn't return total count by default
    // For a real app, you'd need to make a separate aggregate query
    total.value = transactions.value.length < perPage ? (currentPage.value - 1) * perPage + transactions.value.length : currentPage.value * perPage + 1;
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
