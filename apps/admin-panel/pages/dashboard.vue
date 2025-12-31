<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Главная</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 rounded-lg bg-primary-100">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Всего клиентов</p>
            <p v-if="isLoading" class="text-2xl font-bold text-gray-200 animate-pulse">—</p>
            <p v-else class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 rounded-lg bg-green-100">
            <svg class="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Активных уч. записей</p>
            <p v-if="isLoading" class="text-2xl font-bold text-gray-200 animate-pulse">—</p>
            <p v-else class="text-2xl font-bold text-secondary-500">{{ stats.activeAccounts }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 rounded-lg bg-orange-100">
            <svg class="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Неоплаченных счетов</p>
            <p v-if="isLoading" class="text-2xl font-bold text-gray-200 animate-pulse">—</p>
            <p v-else class="text-2xl font-bold text-accent-orange">{{ unpaidInvoicesCount }}</p>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 rounded-lg bg-pink-100">
            <svg class="w-6 h-6 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Сумма к оплате</p>
            <p v-if="isLoading" class="text-2xl font-bold text-gray-200 animate-pulse">—</p>
            <p v-else class="text-2xl font-bold text-accent-pink">{{ formatMoney(totalAmountToPay) }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Overdue Invoices -->
      <BaseCard title="Просроченные счета" class="border-l-4 border-accent-pink">
        <template #header-actions>
          <NuxtLink to="/invoices" class="text-sm text-primary-500 hover:text-primary-600">
            Все счета
          </NuxtLink>
        </template>

        <div v-if="isLoadingInvoices" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between py-2">
            <div class="space-y-2">
              <div class="h-3 w-24 bg-gray-200 rounded" />
              <div class="h-2 w-32 bg-gray-200 rounded" />
            </div>
            <div class="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        <div v-else-if="overdueInvoices.length === 0" class="text-center py-8 text-gray-500">
          Нет просроченных счетов
        </div>

        <div v-else class="space-y-2">
          <NuxtLink
            v-for="invoice in overdueInvoices"
            :key="invoice.id"
            :to="`/invoices/${invoice.id}`"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ invoice.invoice_number }}</p>
              <p class="text-xs text-gray-500">
                Срок: {{ formatDate(invoice.due_date) }}
                <span class="text-accent-pink ml-1">({{ getDaysOverdue(invoice.due_date) }} дн.)</span>
              </p>
            </div>
            <div class="text-right">
              <BalanceDisplay :amount="invoice.amount" size="sm" />
            </div>
          </NuxtLink>
        </div>
      </BaseCard>

      <!-- Recent Payments -->
      <BaseCard title="Последние платежи">
        <template #header-actions>
          <NuxtLink to="/payments" class="text-sm text-primary-500 hover:text-primary-600">
            Все платежи
          </NuxtLink>
        </template>

        <div v-if="isLoadingPayments" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between py-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-200 rounded-full" />
              <div class="space-y-2">
                <div class="h-3 w-20 bg-gray-200 rounded" />
                <div class="h-2 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div class="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        <div v-else-if="recentPayments.length === 0" class="text-center py-8 text-gray-500">
          Нет платежей
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="payment in recentPayments"
            :key="payment.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ payment.account_id }}</p>
                <p class="text-xs text-gray-500">{{ formatPaymentProvider(payment.provider) }}</p>
              </div>
            </div>
            <div class="text-right">
              <BalanceDisplay :amount="payment.amount" size="sm" />
              <StatusBadge :status="payment.status" type="payment" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- New Clients -->
      <BaseCard title="Новые клиенты">
        <template #header-actions>
          <NuxtLink to="/persons" class="text-sm text-primary-500 hover:text-primary-600">
            Все клиенты
          </NuxtLink>
        </template>

        <div v-if="isLoadingPersons" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between py-2">
            <div class="space-y-2">
              <div class="h-3 w-32 bg-gray-200 rounded" />
              <div class="h-2 w-24 bg-gray-200 rounded" />
            </div>
            <div class="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>

        <div v-else-if="recentPersons.length === 0" class="text-center py-8 text-gray-500">
          Нет новых клиентов
        </div>

        <div v-else class="space-y-2">
          <NuxtLink
            v-for="person in recentPersons"
            :key="person.id"
            :to="`/persons/${person.id}`"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ formatFullName(person) }}</p>
              <p class="text-xs text-gray-500">ID: {{ person.id }}</p>
            </div>
            <StatusBadge :status="person.status" type="person" />
          </NuxtLink>
        </div>
      </BaseCard>

      <!-- Blocked Accounts -->
      <BaseCard title="Заблокированные уч. записи">
        <template #header-actions>
          <NuxtLink to="/accounts?status=blocked" class="text-sm text-primary-500 hover:text-primary-600">
            Все заблокированные
          </NuxtLink>
        </template>

        <div v-if="isLoadingAccounts" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex justify-between py-2">
            <div class="space-y-2">
              <div class="h-3 w-28 bg-gray-200 rounded" />
              <div class="h-2 w-20 bg-gray-200 rounded" />
            </div>
            <div class="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        <div v-else-if="blockedAccounts.length === 0" class="text-center py-8 text-gray-500">
          Нет заблокированных учётных записей
        </div>

        <div v-else class="space-y-2">
          <NuxtLink
            v-for="account in blockedAccounts"
            :key="account.id"
            :to="`/accounts/${account.id}`"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ account.contract_number }}-1</p>
              <p class="text-xs text-gray-500">
                Заблокирован: {{ account.blocked_at ? formatDate(account.blocked_at) : '—' }}
              </p>
            </div>
            <div class="text-right">
              <BalanceDisplay :amount="account.balance" size="sm" />
            </div>
          </NuxtLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BalanceDisplay, StatusBadge, formatMoney, formatFullName, formatPaymentProvider, formatDate } from '@pg19/ui';
import type { Person, Payment, Account, Invoice, DashboardStats } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const stats = ref<DashboardStats>({
  totalUsers: 0,
  activeUsers: 0,
  blockedAccounts: 0,
  totalPositiveBalance: 0,
  activeAccounts: 0,
});

const recentPayments = ref<Payment[]>([]);
const recentPersons = ref<Person[]>([]);
const overdueInvoices = ref<Invoice[]>([]);
const blockedAccounts = ref<Account[]>([]);
const unpaidInvoicesCount = ref(0);
const totalAmountToPay = ref(0);

const isLoading = ref(true);
const isLoadingPayments = ref(true);
const isLoadingPersons = ref(true);
const isLoadingInvoices = ref(true);
const isLoadingAccounts = ref(true);

function getDaysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = now.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

onMounted(async () => {
  try {
    const [dashboardStats, payments, persons, unpaidInvoices, blockedAccountsData] = await Promise.all([
      api.getDashboardStats(),
      api.getPayments({ limit: 5 }),
      api.getUsers({ sort: '-created_at', limit: 5 }),
      api.getInvoices({ limit: 100 }),
      api.getAccounts({ limit: 5 }),
    ]);

    stats.value = dashboardStats;
    recentPayments.value = payments as unknown as Payment[];
    recentPersons.value = persons as unknown as Person[];
    blockedAccounts.value = blockedAccountsData as unknown as Account[];

    const invoicesData = unpaidInvoices as unknown as Invoice[];
    unpaidInvoicesCount.value = invoicesData.length;
    totalAmountToPay.value = invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    overdueInvoices.value = invoicesData
      .filter(inv => inv.status === 'overdue' || (inv.due_date && new Date(inv.due_date) < new Date()))
      .slice(0, 5);

  } catch (e) {
    console.error('Failed to load dashboard data:', e);
  } finally {
    isLoading.value = false;
    isLoadingPayments.value = false;
    isLoadingPersons.value = false;
    isLoadingInvoices.value = false;
    isLoadingAccounts.value = false;
  }
});
</script>
