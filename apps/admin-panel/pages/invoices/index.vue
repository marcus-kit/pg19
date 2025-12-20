<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Счета</h1>
      <BaseButton variant="primary" @click="$router.push('/invoices/create')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Создать счёт
      </BaseButton>
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
        <DateRangePicker
          v-model:start-date="filter.startDate"
          v-model:end-date="filter.endDate"
          @change="handleSearch"
        />
      </div>
    </BaseCard>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <BaseCard>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Всего</p>
          <p class="text-xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">К оплате</p>
          <p class="text-xl font-bold text-accent-orange">{{ stats.unpaid }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Просрочено</p>
          <p class="text-xl font-bold text-accent-pink">{{ stats.overdue }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Сумма к оплате</p>
          <p class="text-xl font-bold text-primary-500">{{ formatMoney(stats.totalAmount) }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseTable
        :columns="columns"
        :data="invoices"
        :loading="isLoading"
        row-key="id"
        clickable
        @row-click="handleRowClick"
      >
        <template #cell-invoice_number="{ row }">
          <span class="font-medium text-gray-900">{{ row.invoice_number }}</span>
        </template>

        <template #cell-account="{ row }">
          <span class="text-sm text-gray-600">{{ row.account_id }}</span>
        </template>

        <template #cell-period="{ row }">
          <span v-if="row.period_start && row.period_end" class="text-sm text-gray-600">
            {{ formatDate(row.period_start) }} — {{ formatDate(row.period_end) }}
          </span>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #cell-amount="{ row }">
          <BalanceDisplay :amount="row.amount" />
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" type="invoice" />
        </template>

        <template #cell-due_date="{ row }">
          <span v-if="row.due_date" :class="isOverdue(row) ? 'text-accent-pink font-medium' : 'text-gray-600'">
            {{ formatDate(row.due_date) }}
            <span v-if="isOverdue(row)" class="text-xs">(просрочен)</span>
          </span>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #cell-date_created="{ row }">
          {{ formatDate(row.date_created) }}
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
  DateRangePicker,
  BalanceDisplay,
  StatusBadge,
  formatDate,
  formatMoney,
} from '@pg19/ui';
import type { Invoice } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const api = useApi();

const invoices = ref<Invoice[]>([]);
const isLoading = ref(true);
const search = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;

const filter = reactive({
  startDate: null as string | null,
  endDate: null as string | null,
});

const stats = ref({
  total: 0,
  unpaid: 0,
  overdue: 0,
  totalAmount: 0,
});

const columns = [
  { key: 'invoice_number', label: 'Номер' },
  { key: 'account', label: 'Учётная запись' },
  { key: 'period', label: 'Период' },
  { key: 'amount', label: 'Сумма', align: 'right' as const },
  { key: 'status', label: 'Статус' },
  { key: 'due_date', label: 'Срок оплаты' },
  { key: 'date_created', label: 'Создан' },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'draft', label: 'Черновик' },
  { value: 'issued', label: 'Выставлен' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'overdue', label: 'Просрочен' },
  { value: 'cancelled', label: 'Отменён' },
];

function isOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

function handleRowClick(row: Invoice) {
  router.push(`/invoices/${row.id}`);
}

function handleSearch() {
  currentPage.value = 1;
  loadInvoices();
}

watch([currentPage, statusFilter], () => {
  loadInvoices();
});

async function loadInvoices() {
  isLoading.value = true;

  try {
    const queryFilter: Record<string, unknown> = {};

    if (statusFilter.value) {
      queryFilter.status = { _eq: statusFilter.value };
    }

    if (filter.startDate) {
      queryFilter.date_created = { ...queryFilter.date_created as object, _gte: filter.startDate };
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setDate(endDate.getDate() + 1);
      queryFilter.date_created = { ...queryFilter.date_created as object, _lt: endDate.toISOString().split('T')[0] };
    }

    const result = await api.getInvoices({
      filter: queryFilter,
      search: search.value || undefined,
      sort: ['-date_created'],
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    invoices.value = result as unknown as Invoice[];
    total.value = invoices.value.length < perPage
      ? (currentPage.value - 1) * perPage + invoices.value.length
      : currentPage.value * perPage + 1;
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoading.value = false;
  }
}

async function loadStats() {
  try {
    const allInvoices = await api.getInvoices({
      filter: {
        _or: [
          { status: { _eq: 'issued' } },
          { status: { _eq: 'overdue' } },
        ],
      },
      limit: 1000,
    }) as unknown as Invoice[];

    const now = new Date();
    stats.value = {
      total: allInvoices.length,
      unpaid: allInvoices.filter(inv => inv.status === 'issued' || inv.status === 'overdue').length,
      overdue: allInvoices.filter(inv => inv.status === 'overdue' || (inv.due_date && new Date(inv.due_date) < now)).length,
      totalAmount: allInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    };
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

onMounted(() => {
  loadInvoices();
  loadStats();
});
</script>
