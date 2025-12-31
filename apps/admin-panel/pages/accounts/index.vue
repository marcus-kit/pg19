<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Учётные записи</h1>
    </div>

    <!-- Filters -->
    <BaseCard class="mb-6" :padding="true">
      <div class="flex flex-col md:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Поиск по номеру учётной записи..."
          class="flex-1"
          @search="handleSearch"
        />
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          class="md:w-48"
        />
      </div>
    </BaseCard>

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseTable
        :columns="columns"
        :data="accounts"
        :loading="isLoading"
        row-key="id"
        clickable
        @row-click="handleRowClick"
      >
        <template #cell-account_number="{ row }">
          <span class="font-medium text-gray-900">{{ row.account_number }}</span>
        </template>

        <template #cell-balance="{ row }">
          <BalanceDisplay :amount="row.balance" />
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" type="account" />
        </template>

        <template #cell-address="{ row }">
          <span class="text-sm text-gray-600">{{ getAccountAddress(row) || '—' }}</span>
        </template>

        <template #cell-next_charge_date="{ row }">
          {{ row.next_charge_date ? formatDate(row.next_charge_date) : '—' }}
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
  BasePagination,
  SearchInput,
  BalanceDisplay,
  StatusBadge,
  formatDate,
  formatAddress,
} from '@pg19/ui';
import type { Account } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const api = useApi();

const accounts = ref<Account[]>([]);
const isLoading = ref(true);
const search = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;

const columns = [
  { key: 'account_number', label: 'Номер записи' },
  { key: 'balance', label: 'Баланс', align: 'right' as const },
  { key: 'status', label: 'Статус' },
  { key: 'address', label: 'Адрес' },
  { key: 'next_charge_date', label: 'Следующее списание' },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'blocked', label: 'Заблокированные' },
  { value: 'closed', label: 'Закрытые' },
];

function getAccountAddress(account: Account): string {
  if (account.address_full) return account.address_full;
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
}

function handleRowClick(row: Account) {
  router.push(`/accounts/${row.id}`);
}

function handleSearch() {
  currentPage.value = 1;
  loadAccounts();
}

watch([currentPage, statusFilter], () => {
  loadAccounts();
});

async function loadAccounts() {
  isLoading.value = true;

  try {
    const filter: Record<string, unknown> = {};

    if (statusFilter.value) {
      filter.status = { _eq: statusFilter.value };
    }

    const result = await api.getAccounts({
      filter,
      search: search.value || undefined,
      sort: '-date_created',
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    accounts.value = result as unknown as Account[];
    total.value = accounts.value.length < perPage
      ? (currentPage.value - 1) * perPage + accounts.value.length
      : currentPage.value * perPage + 1;
  } catch (e) {
    console.error('Failed to load accounts:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadAccounts();
});
</script>
