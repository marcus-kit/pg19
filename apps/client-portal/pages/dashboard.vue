<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Главная</h1>

    <!-- Accounts List -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Ваши учётные записи</h2>

      <div v-if="authStore.accounts.length === 0" class="text-center py-8 text-gray-500">
        <p>Нет учётных записей</p>
      </div>

      <div v-else class="space-y-4">
        <BaseCard v-for="account in authStore.accounts" :key="account.id">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-medium text-gray-900">{{ account.account_number }}</span>
                <StatusBadge :status="account.status" type="account" />
              </div>
              <div v-if="getAccountSubscription(account.id)" class="text-sm text-gray-600 mb-1">
                Сервис: {{ getAccountSubscription(account.id)?.service?.name || 'Не определён' }}
              </div>
              <div class="text-sm text-gray-500">
                Баланс: <BalanceDisplay :amount="account.balance" size="sm" class="inline" />
              </div>
              <div v-if="account.next_charge_date" class="text-xs text-gray-400 mt-1">
                Следующее списание: {{ formatDate(account.next_charge_date) }}
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div v-if="getUnpaidInvoicesCount(account.id) > 0" class="text-sm text-accent-pink font-medium">
                {{ getUnpaidInvoicesCount(account.id) }} неоплаченных счетов
              </div>
              <BaseButton
                v-if="getUnpaidInvoicesCount(account.id) > 0"
                variant="primary"
                size="sm"
                @click="goToInvoices"
              >
                Оплатить счёт
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Unpaid Invoices -->
    <BaseCard v-if="unpaidInvoices.length > 0" class="mb-6 border-l-4 border-accent-pink">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Неоплаченные счета</h3>
        <NuxtLink to="/invoices" class="text-sm text-primary-500 hover:text-primary-600">
          Все счета
        </NuxtLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="invoice in unpaidInvoices"
          :key="invoice.id"
          class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
        >
          <div>
            <p class="font-medium text-gray-900">{{ invoice.invoice_number }}</p>
            <p v-if="invoice.period_start && invoice.period_end" class="text-sm text-gray-500">
              {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
            </p>
            <p v-if="invoice.due_date" class="text-xs" :class="isOverdue(invoice) ? 'text-accent-pink' : 'text-gray-400'">
              Срок оплаты: {{ formatDate(invoice.due_date) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <BalanceDisplay :amount="invoice.amount" />
            <StatusBadge :status="invoice.status" type="invoice" />
            <BaseButton variant="primary" size="sm" @click="payInvoice(invoice)">
              Оплатить
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Current Service -->
    <BaseCard v-if="currentSubscription" class="mb-6" title="Текущий сервис">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-lg font-semibold text-gray-900">
            {{ currentSubscription.service?.name || 'Сервис' }}
          </p>
          <p v-if="currentSubscription.service?.description" class="text-sm text-gray-500 mt-1">
            {{ currentSubscription.service.description }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold text-gray-900">
            {{ formatMoney(subscriptionPrice) }}/мес
          </p>
          <StatusBadge :status="currentSubscription.status" type="subscription" />
        </div>
      </div>
    </BaseCard>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <NuxtLink to="/invoices">
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Счета</p>
              <p class="text-sm text-gray-500">Оплата и история</p>
            </div>
          </div>
        </BaseCard>
      </NuxtLink>

      <NuxtLink to="/transactions">
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Операции</p>
              <p class="text-sm text-gray-500">История операций</p>
            </div>
          </div>
        </BaseCard>
      </NuxtLink>

      <NuxtLink to="/services">
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Сервисы</p>
              <p class="text-sm text-gray-500">Смена сервиса</p>
            </div>
          </div>
        </BaseCard>
      </NuxtLink>
    </div>

    <!-- Recent Transactions -->
    <BaseCard title="Последние операции">
      <template #header-actions>
        <NuxtLink to="/transactions" class="text-sm text-primary-500 hover:text-primary-600">
          Все операции
        </NuxtLink>
      </template>

      <div v-if="isLoadingTransactions" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse flex justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full" />
            <div class="space-y-2">
              <div class="h-4 w-24 bg-gray-200 rounded" />
              <div class="h-3 w-16 bg-gray-200 rounded" />
            </div>
          </div>
          <div class="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>

      <div v-else-if="recentTransactions.length === 0" class="text-center py-8 text-gray-500">
        Нет операций
      </div>

      <div v-else>
        <TransactionRow
          v-for="tx in recentTransactions"
          :key="tx.id"
          :transaction="tx"
        />
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BalanceDisplay, StatusBadge, TransactionRow, formatDate, formatMoney } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Transaction, Subscription, Invoice } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const authStore = useAuthStore();
const api = useApi();

const recentTransactions = ref<Transaction[]>([]);
const currentSubscription = ref<Subscription | null>(null);
const subscriptions = ref<Subscription[]>([]);
const unpaidInvoices = ref<Invoice[]>([]);
const allInvoices = ref<Invoice[]>([]);
const isLoadingTransactions = ref(true);

const subscriptionPrice = computed(() => {
  if (!currentSubscription.value) return 0;
  if (currentSubscription.value.custom_price !== null) {
    return currentSubscription.value.custom_price;
  }
  return (currentSubscription.value.service?.price_monthly || 0) * 100;
});

function getAccountSubscription(accountId: string): Subscription | undefined {
  return subscriptions.value.find(s => s.account_id === accountId && s.status === 'active');
}

function getUnpaidInvoicesCount(accountId: string): number {
  return allInvoices.value.filter(
    inv => inv.account_id === accountId && (inv.status === 'issued' || inv.status === 'overdue')
  ).length;
}

function isOverdue(invoice: Invoice): boolean {
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

function goToInvoices() {
  router.push('/invoices');
}

function payInvoice(invoice: Invoice) {
  alert(`Функция оплаты счёта ${invoice.invoice_number} будет доступна в ближайшее время.`);
}

onMounted(async () => {
  const accountIds = authStore.accounts.map(a => a.id);
  if (accountIds.length === 0) return;

  try {
    const promises: Promise<any>[] = [];

    // Load transactions for primary account
    const primaryAccountId = authStore.primaryAccount?.id;
    if (primaryAccountId) {
      promises.push(api.getAccountTransactions(primaryAccountId, { limit: 5 }));
    } else {
      promises.push(Promise.resolve([]));
    }

    // Load subscriptions for all accounts
    promises.push(api.getSubscriptions({
      filter: { account_id: { _in: accountIds } },
      fields: ['*', 'service_id.*'],
    }));

    // Load invoices for all accounts
    promises.push(api.getInvoices({
      filter: { account_id: { _in: accountIds } },
      sort: ['-date_created'],
      limit: 50,
    }));

    const [transactionsData, subscriptionsData, invoicesData] = await Promise.all(promises);

    recentTransactions.value = transactionsData as unknown as Transaction[];
    subscriptions.value = subscriptionsData as unknown as Subscription[];
    allInvoices.value = invoicesData as unknown as Invoice[];

    // Filter unpaid invoices
    unpaidInvoices.value = allInvoices.value.filter(
      inv => inv.status === 'issued' || inv.status === 'overdue'
    ).slice(0, 5);

    // Get current subscription for primary account
    currentSubscription.value = subscriptions.value.find(
      s => s.account_id === primaryAccountId && s.status === 'active'
    ) || null;

  } catch (e) {
    console.error('Failed to load dashboard data:', e);
  } finally {
    isLoadingTransactions.value = false;
  }
});
</script>
