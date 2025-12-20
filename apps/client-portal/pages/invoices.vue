<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Счета</h1>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.value
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            :class="[
              'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
              activeTab === tab.value
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <BaseCard>
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between py-4 border-b border-gray-100">
          <div class="space-y-2">
            <div class="h-4 w-32 bg-gray-200 rounded" />
            <div class="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div class="flex items-center gap-4">
            <div class="h-4 w-20 bg-gray-200 rounded" />
            <div class="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      <div v-else-if="filteredInvoices.length === 0" class="text-center py-12 text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>{{ emptyMessage }}</p>
      </div>

      <div v-else>
        <div
          v-for="invoice in filteredInvoices"
          :key="invoice.id"
          class="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4"
        >
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ invoice.invoice_number }}</p>
            <p v-if="invoice.period_start && invoice.period_end" class="text-sm text-gray-500">
              Период: {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
            </p>
            <p class="text-xs text-gray-400">
              {{ invoice.issued_at ? `Выставлен: ${formatDate(invoice.issued_at)}` : `Создан: ${formatDate(invoice.date_created)}` }}
            </p>
            <p v-if="invoice.due_date" class="text-xs" :class="isOverdue(invoice) ? 'text-accent-pink font-medium' : 'text-gray-400'">
              Срок оплаты: {{ formatDate(invoice.due_date) }}
              <span v-if="isOverdue(invoice)" class="ml-1">(просрочен)</span>
            </p>
          </div>
          <div class="flex items-center gap-4">
            <BalanceDisplay :amount="invoice.amount" />
            <StatusBadge :status="invoice.status" type="invoice" />
            <BaseButton
              v-if="invoice.status === 'issued' || invoice.status === 'overdue'"
              variant="primary"
              size="sm"
              @click="payInvoice(invoice)"
            >
              Оплатить
            </BaseButton>
            <BaseButton
              v-else
              variant="ghost"
              size="sm"
              disabled
              title="Скоро будет доступно"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </BaseButton>
          </div>
        </div>
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
import { BaseCard, BaseButton, BalanceDisplay, StatusBadge, BasePagination, formatDate } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Invoice, InvoiceStatus } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

const invoices = ref<Invoice[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;
const activeTab = ref<'unpaid' | 'paid' | 'all'>('unpaid');

const tabs = computed(() => [
  {
    value: 'unpaid' as const,
    label: 'Неоплаченные',
    count: invoices.value.filter(inv => inv.status === 'issued' || inv.status === 'overdue').length,
  },
  {
    value: 'paid' as const,
    label: 'Оплаченные',
    count: invoices.value.filter(inv => inv.status === 'paid').length,
  },
  {
    value: 'all' as const,
    label: 'Все',
    count: invoices.value.length,
  },
]);

const filteredInvoices = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return invoices.value.filter(inv => inv.status === 'issued' || inv.status === 'overdue');
    case 'paid':
      return invoices.value.filter(inv => inv.status === 'paid');
    default:
      return invoices.value;
  }
});

const emptyMessage = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return 'Нет неоплаченных счетов';
    case 'paid':
      return 'Нет оплаченных счетов';
    default:
      return 'Счета не найдены';
  }
});

function isOverdue(invoice: Invoice): boolean {
  if (invoice.status !== 'issued' && invoice.status !== 'overdue') return false;
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

function payInvoice(invoice: Invoice) {
  alert(`Функция оплаты счёта ${invoice.invoice_number} будет доступна в ближайшее время.`);
}

watch(currentPage, () => {
  loadInvoices();
});

async function loadInvoices() {
  const accountIds = authStore.accounts.map(a => a.id);
  if (accountIds.length === 0) return;

  isLoading.value = true;

  try {
    const result = await api.getInvoices({
      filter: { account_id: { _in: accountIds } },
      sort: ['-date_created'],
      limit: 100, // Load all for client-side filtering
    });

    invoices.value = result as unknown as Invoice[];
    total.value = invoices.value.length;
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadInvoices();
});
</script>
