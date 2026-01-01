<template>
  <!-- Loading skeleton -->
  <DashboardSkeleton v-if="isInitialLoading" />

  <div v-else class="space-y-6">
    <!-- Account Summary Header -->
    <AccountSummaryCard
      :balance="authStore.currentBalance"
      :status="account?.status || 'unknown'"
      :contract-number="String(authStore.account?.contract_number || '')"
      :days-remaining="daysRemaining"
      :unpaid-count="unpaidInvoicesCount"
      :has-overdue="hasOverdueInvoices"
    />

    <!-- Connection Status Card -->
    <BaseCard v-if="account" class="border-l-4 dark:bg-slate-800" :class="connectionStatusBorderClass">
      <div class="flex items-center gap-4 mb-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="connectionStatusBgClass"
        >
          <WifiIcon v-if="isConnected" class="w-6 h-6 text-secondary-600" />
          <WifiOffIcon v-else class="w-6 h-6 text-red-600" />
        </div>
        <div class="flex items-center justify-between flex-1">
          <span
            class="inline-flex items-center gap-1.5 text-sm font-medium"
            :class="connectionStatusTextClass"
          >
            <span class="w-2 h-2 rounded-full" :class="connectionStatusDotClass" />
            {{ connectionStatusText }}
          </span>
          <NuxtLink
            to="/services"
            class="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            Управление услугами →
          </NuxtLink>
        </div>
      </div>

      <!-- Services List -->
      <ServicesSummary
        v-if="activeSubscriptions.length > 0"
        :subscriptions="activeSubscriptions"
        :max-visible="3"
      />
    </BaseCard>

    <!-- Alerts / Notifications -->
    <BaseAlert v-if="hasOverdueInvoices" variant="error">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ExclamationIcon class="w-5 h-5" />
          <span>У вас {{ overdueInvoicesCount }} просроченных счетов на сумму {{ formatMoney(overdueAmount) }}</span>
        </div>
        <NuxtLink to="/invoices" class="font-medium underline">
          Оплатить
        </NuxtLink>
      </div>
    </BaseAlert>

    <BaseAlert v-if="lowBalance && !hasOverdueInvoices" variant="warning">
      <div class="flex items-center gap-2">
        <ExclamationIcon class="w-5 h-5" />
        <span>Низкий баланс. Рекомендуем пополнить счёт.</span>
      </div>
    </BaseAlert>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <NuxtLink to="/payment">
        <QuickActionCard
          icon="wallet"
          label="Оплата"
          :badge="hasUnpaidInvoices ? unpaidInvoicesCount : undefined"
          color="primary"
          :size="hasOverdueInvoices ? 'lg' : 'md'"
          :emphasized="hasOverdueInvoices"
        />
      </NuxtLink>
      <NuxtLink to="/transactions">
        <QuickActionCard
          icon="history"
          label="История"
          color="gray"
        />
      </NuxtLink>
      <NuxtLink to="/support">
        <QuickActionCard
          icon="support"
          label="Поддержка"
          :badge="openTicketsCount || undefined"
          color="secondary"
        />
      </NuxtLink>
      <NuxtLink to="/profile">
        <QuickActionCard
          icon="user"
          label="Профиль"
          color="gray"
        />
      </NuxtLink>
    </div>

    <!-- Two Column Layout for Desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Special Offer: PG-Ai Silver -->
      <div
        v-if="!isPromoDismissed"
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl"
      >
        <!-- Close button -->
        <button
          class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          aria-label="Скрыть предложение"
          @click="dismissPromo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Background decoration -->
        <div class="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div class="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        <!-- Badge -->
        <div class="relative mb-4">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <SparklesIcon class="h-3.5 w-3.5" />
            Специальное предложение
          </span>
        </div>

        <!-- Content -->
        <div class="relative">
          <h3 class="mb-2 text-2xl font-bold">PG-Ai Silver</h3>
          <p class="mb-1 text-lg font-medium text-white/90">Бесплатно на 30 дней!</p>
          <p class="mb-6 text-sm text-white/70">
            Умный помощник для управления услугами, анализа расходов и персональных рекомендаций
          </p>

          <!-- Timer -->
          <div class="mb-6 flex items-center gap-2 text-sm text-white/80">
            <ClockIcon class="h-4 w-4" />
            <span>Предложение действует до {{ endOfMonth }}</span>
          </div>

          <!-- Button -->
          <BaseButton
            variant="white"
            size="lg"
            class="w-full sm:w-auto"
            @click="activatePromo"
          >
            <SparklesIcon class="mr-2 h-5 w-5" />
            Подключить бесплатно
          </BaseButton>
        </div>
      </div>

      <!-- Unpaid Invoices -->
      <BaseCard title="Счета к оплате">
        <template #header-actions>
          <NuxtLink to="/invoices" class="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Все счета →
          </NuxtLink>
        </template>

        <div v-if="isLoadingInvoices" class="space-y-4">
          <div v-for="i in 2" :key="i" class="animate-pulse">
            <div class="flex justify-between items-center">
              <div class="space-y-2">
                <div class="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
                <div class="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
              </div>
              <div class="h-8 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>

        <div v-else-if="unpaidInvoices.length === 0" class="text-center py-8">
          <CheckCircleIcon class="w-12 h-12 text-secondary-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">Все счета оплачены</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="invoice in unpaidInvoices"
            :key="invoice.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ invoice.invoice_number }}</p>
              <p v-if="invoice.period_start && invoice.period_end" class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
              </p>
              <p
                v-if="invoice.due_date"
                class="text-xs mt-0.5"
                :class="isOverdue(invoice) ? 'text-accent-pink font-medium' : 'text-gray-400'"
              >
                {{ isOverdue(invoice) ? 'Просрочен' : 'До' }} {{ formatDate(invoice.due_date) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-semibold text-gray-900 dark:text-white">{{ formatMoney(invoice.amount) }}</span>
              <NuxtLink :to="`/payment?invoice=${invoice.id}`">
                <BaseButton variant="primary" size="sm">
                  Оплатить
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Last Payment Info -->
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <LastPaymentInfo :payment="lastPayment" :is-loading="isLoadingLastPayment" />
        </div>
      </BaseCard>
    </div>

    <!-- Collapsible News Widget -->
    <NewsWidget />
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseButton,
  BaseAlert,
  formatDate,
  formatMoney
} from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Subscription, Invoice, Transaction } from '@pg19/types';

// Icons
import WifiIcon from '~/components/icons/WifiIcon.vue';
import WifiOffIcon from '~/components/icons/WifiOffIcon.vue';
import ClockIcon from '~/components/icons/ClockIcon.vue';
import ExclamationIcon from '~/components/icons/ExclamationIcon.vue';
import CheckCircleIcon from '~/components/icons/CheckCircleIcon.vue';
import SparklesIcon from '~/components/icons/SparklesIcon.vue';

// Dashboard components
import AccountSummaryCard from '~/components/dashboard/AccountSummaryCard.vue';
import ServicesSummary from '~/components/dashboard/ServicesSummary.vue';
import QuickActionCard from '~/components/dashboard/QuickActionCard.vue';
import LastPaymentInfo from '~/components/dashboard/LastPaymentInfo.vue';
import DashboardSkeleton from '~/components/dashboard/DashboardSkeleton.vue';
import NewsWidget from '~/components/dashboard/NewsWidget.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// Storage keys
const PROMO_DISMISSED_KEY = 'pg19-promo-ai-silver-dismissed';

// Data
const activeSubscriptions = ref<Subscription[]>([]);
const unpaidInvoices = ref<Invoice[]>([]);
const lastPayment = ref<Transaction | null>(null);
const isInitialLoading = ref(true);
const isLoadingInvoices = ref(true);
const isLoadingLastPayment = ref(true);
const openTicketsCount = ref(0);
const hasAutopay = ref(false);
const isPromoDismissed = ref(false);

// Computed
const account = computed(() => authStore.account);

// next_charge_date removed from schema - calculate from subscription if needed
const nextChargeDate = computed(() => null);

const totalMonthlyCharge = computed(() => {
  return activeSubscriptions.value.reduce((sum, sub) => {
    // custom_price and price_monthly are already in kopeks
    const price = sub.custom_price !== null
      ? sub.custom_price
      : (sub.service?.price_monthly || 0);
    return sum + price;
  }, 0);
});

const monthlyCharge = computed(() => totalMonthlyCharge.value);

const daysRemaining = computed(() => {
  if (authStore.currentBalance <= 0 || totalMonthlyCharge.value <= 0) return null;
  const dailyRate = totalMonthlyCharge.value / 30;
  return Math.floor(authStore.currentBalance / dailyRate);
});

const isConnected = computed(() => {
  return account.value?.status === 'active';
});

const connectionStatusText = computed(() => {
  if (!account.value) return 'Нет данных';
  switch (account.value.status) {
    case 'active': return 'Подключён';
    case 'blocked': return 'Заблокирован';
    case 'closed': return 'Закрыт';
    default: return 'Неизвестно';
  }
});

const connectionStatusBorderClass = computed(() => {
  if (!account.value) return 'border-gray-300';
  return account.value.status === 'active'
    ? 'border-secondary-500'
    : 'border-accent-pink';
});

const connectionStatusBgClass = computed(() => {
  if (!account.value) return 'bg-gray-100 dark:bg-slate-700';
  return account.value.status === 'active'
    ? 'bg-secondary-100 dark:bg-secondary-900/30'
    : 'bg-red-100 dark:bg-red-900/30';
});

const connectionStatusTextClass = computed(() => {
  if (!account.value) return 'text-gray-500';
  return account.value.status === 'active'
    ? 'text-secondary-600'
    : 'text-red-600';
});

const connectionStatusDotClass = computed(() => {
  if (!account.value) return 'bg-gray-400';
  return account.value.status === 'active'
    ? 'bg-secondary-500 animate-pulse'
    : 'bg-red-500';
});

const lowBalance = computed(() => {
  return authStore.currentBalance < totalMonthlyCharge.value && authStore.currentBalance > 0;
});

const hasUnpaidInvoices = computed(() => unpaidInvoices.value.length > 0);
const unpaidInvoicesCount = computed(() => unpaidInvoices.value.length);

const hasOverdueInvoices = computed(() => {
  return unpaidInvoices.value.some(inv => isOverdue(inv));
});

const overdueInvoicesCount = computed(() => {
  return unpaidInvoices.value.filter(inv => isOverdue(inv)).length;
});

const overdueAmount = computed(() => {
  return unpaidInvoices.value
    .filter(inv => isOverdue(inv))
    .reduce((sum, inv) => sum + inv.amount, 0);
});

const endOfMonth = computed(() => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(lastDay);
});

// Methods
function isOverdue(invoice: Invoice): boolean {
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

function activatePromo() {
  // TODO: Activate PG-Ai Silver promo via API
  alert('Поздравляем! Подписка PG-Ai Silver активирована на 30 дней бесплатно.');
}

function dismissPromo() {
  isPromoDismissed.value = true;
  localStorage.setItem(PROMO_DISMISSED_KEY, 'true');
}

// Load dashboard data
async function loadDashboardData(accountId: number) {
  try {
    // Load subscriptions
    const subs = await api.getSubscriptions(accountId);
    activeSubscriptions.value = subs.filter(s => s.status === 'active');
  } catch (e) {
    console.error('Failed to load subscriptions:', e);
  } finally {
    isInitialLoading.value = false;
  }

  // Load invoices
  try {
    const { data } = await api.getInvoices(accountId, { limit: 5 });
    unpaidInvoices.value = data.filter(inv => inv.status === 'issued' || inv.status === 'overdue').slice(0, 5);
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoadingInvoices.value = false;
  }

  // Load last payment
  try {
    lastPayment.value = await api.getLastPayment(accountId);
  } catch (e) {
    console.error('Failed to load last payment:', e);
  } finally {
    isLoadingLastPayment.value = false;
  }
}

onMounted(async () => {
  // Ensure auth state is hydrated from localStorage
  authStore.hydrate();

  // Restore promo dismissed state
  isPromoDismissed.value = localStorage.getItem(PROMO_DISMISSED_KEY) === 'true';

  // Wait for next tick to ensure Pinia state is updated
  await nextTick();

  const accountId = authStore.account?.id;
  if (accountId) {
    loadDashboardData(accountId);
  } else {
    isInitialLoading.value = false;
  }
});
</script>
