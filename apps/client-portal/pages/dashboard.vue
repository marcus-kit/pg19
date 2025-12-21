<template>
  <div class="space-y-6">
    <!-- Hero Balance Block -->
    <div class="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-primary-100 text-sm font-medium mb-1">Баланс</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold">{{ formatMoney(authStore.currentBalance) }}</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-4 text-sm">
            <div v-if="nextChargeDate" class="flex items-center gap-1.5">
              <CalendarIcon class="w-4 h-4 text-primary-200" />
              <span class="text-primary-100">Списание {{ formatDate(nextChargeDate) }}</span>
              <span class="font-medium">{{ formatMoney(monthlyCharge) }}</span>
            </div>
            <div v-if="daysRemaining !== null" class="flex items-center gap-1.5">
              <ClockIcon class="w-4 h-4 text-primary-200" />
              <span class="text-primary-100">Хватит на</span>
              <span class="font-medium">{{ daysRemaining }} дн.</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <NuxtLink to="/payment">
            <BaseButton variant="white" size="lg" class="w-full md:w-auto">
              <WalletIcon class="w-5 h-5 mr-2" />
              Пополнить
            </BaseButton>
          </NuxtLink>
          <button
            v-if="hasAutopay"
            class="text-xs text-primary-200 hover:text-white transition-colors text-center"
          >
            Автоплатёж подключён
          </button>
        </div>
      </div>
    </div>

    <!-- Connection Status Card -->
    <BaseCard v-if="primaryAccount" class="border-l-4" :class="connectionStatusBorderClass">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :class="connectionStatusBgClass"
          >
            <WifiIcon v-if="isConnected" class="w-6 h-6 text-secondary-600" />
            <WifiOffIcon v-else class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 text-sm font-medium"
                :class="connectionStatusTextClass"
              >
                <span class="w-2 h-2 rounded-full" :class="connectionStatusDotClass" />
                {{ connectionStatusText }}
              </span>
            </div>
            <p v-if="currentTariff" class="text-gray-900 font-semibold mt-0.5">
              {{ currentTariff.name }}
            </p>
            <p v-if="currentTariff?.description" class="text-sm text-gray-500">
              {{ currentTariff.description }}
            </p>
          </div>
        </div>
        <div class="flex flex-col md:items-end gap-1">
          <div v-if="currentTariff" class="text-lg font-bold text-gray-900">
            {{ formatMoney(tariffPrice) }}<span class="text-sm font-normal text-gray-500">/мес</span>
          </div>
          <NuxtLink
            to="/services"
            class="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            Сменить тариф →
          </NuxtLink>
        </div>
      </div>
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
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
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
                <div class="h-4 w-32 bg-gray-200 rounded" />
                <div class="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div class="h-8 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div v-else-if="unpaidInvoices.length === 0" class="text-center py-8">
          <CheckCircleIcon class="w-12 h-12 text-secondary-400 mx-auto mb-3" />
          <p class="text-gray-500">Все счета оплачены</p>
        </div>

        <div v-else class="space-y-3">
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
              <p
                v-if="invoice.due_date"
                class="text-xs mt-0.5"
                :class="isOverdue(invoice) ? 'text-accent-pink font-medium' : 'text-gray-400'"
              >
                {{ isOverdue(invoice) ? 'Просрочен' : 'До' }} {{ formatDate(invoice.due_date) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-semibold text-gray-900">{{ formatMoney(invoice.amount) }}</span>
              <NuxtLink :to="`/payment?invoice=${invoice.id}`">
                <BaseButton variant="primary" size="sm">
                  Оплатить
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Account Details (if multiple accounts) -->
    <BaseCard v-if="authStore.accounts.length > 1" title="Лицевые счета">
      <div class="space-y-4">
        <div
          v-for="account in authStore.accounts"
          :key="account.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ account.account_number }}</p>
              <p v-if="account.address_full" class="text-sm text-gray-500">{{ account.address_full }}</p>
            </div>
          </div>
          <div class="text-right">
            <BalanceDisplay :amount="account.balance" size="lg" />
            <StatusBadge :status="account.status" type="account" class="mt-1" />
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
  BaseAlert,
  BalanceDisplay,
  StatusBadge,
  formatDate,
  formatMoney
} from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Subscription, Invoice, Service } from '@pg19/types';

// Icons
import WalletIcon from '~/components/icons/WalletIcon.vue';
import WifiIcon from '~/components/icons/WifiIcon.vue';
import WifiOffIcon from '~/components/icons/WifiOffIcon.vue';
import CalendarIcon from '~/components/icons/CalendarIcon.vue';
import ClockIcon from '~/components/icons/ClockIcon.vue';
import ExclamationIcon from '~/components/icons/ExclamationIcon.vue';
import CheckCircleIcon from '~/components/icons/CheckCircleIcon.vue';
import CreditCardIcon from '~/components/icons/CreditCardIcon.vue';
import SparklesIcon from '~/components/icons/SparklesIcon.vue';
import QuickActionCard from '~/components/dashboard/QuickActionCard.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// Data
const currentSubscription = ref<Subscription | null>(null);
const unpaidInvoices = ref<Invoice[]>([]);
const isLoadingInvoices = ref(true);
const openTicketsCount = ref(0);
const hasAutopay = ref(false);

// Computed
const primaryAccount = computed(() => authStore.primaryAccount);

const nextChargeDate = computed(() => primaryAccount.value?.next_charge_date);

const currentTariff = computed<Service | null>(() => {
  if (!currentSubscription.value?.service) return null;
  return currentSubscription.value.service;
});

const tariffPrice = computed(() => {
  if (!currentSubscription.value) return 0;
  if (currentSubscription.value.custom_price !== null) {
    return currentSubscription.value.custom_price;
  }
  return (currentSubscription.value.service?.price_monthly || 0) * 100;
});

const monthlyCharge = computed(() => tariffPrice.value);

const daysRemaining = computed(() => {
  if (authStore.currentBalance <= 0 || tariffPrice.value <= 0) return null;
  const dailyRate = tariffPrice.value / 30;
  return Math.floor(authStore.currentBalance / dailyRate);
});

const isConnected = computed(() => {
  return primaryAccount.value?.status === 'active';
});

const connectionStatusText = computed(() => {
  if (!primaryAccount.value) return 'Нет данных';
  switch (primaryAccount.value.status) {
    case 'active': return 'Подключён';
    case 'blocked': return 'Заблокирован';
    case 'closed': return 'Закрыт';
    default: return 'Неизвестно';
  }
});

const connectionStatusBorderClass = computed(() => {
  if (!primaryAccount.value) return 'border-gray-300';
  return primaryAccount.value.status === 'active'
    ? 'border-secondary-500'
    : 'border-accent-pink';
});

const connectionStatusBgClass = computed(() => {
  if (!primaryAccount.value) return 'bg-gray-100';
  return primaryAccount.value.status === 'active'
    ? 'bg-secondary-100'
    : 'bg-red-100';
});

const connectionStatusTextClass = computed(() => {
  if (!primaryAccount.value) return 'text-gray-500';
  return primaryAccount.value.status === 'active'
    ? 'text-secondary-600'
    : 'text-red-600';
});

const connectionStatusDotClass = computed(() => {
  if (!primaryAccount.value) return 'bg-gray-400';
  return primaryAccount.value.status === 'active'
    ? 'bg-secondary-500 animate-pulse'
    : 'bg-red-500';
});

const lowBalance = computed(() => {
  return authStore.currentBalance < tariffPrice.value && authStore.currentBalance > 0;
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

// Load data
onMounted(async () => {
  const accountIds = authStore.accounts.map(a => a.id);
  if (accountIds.length === 0) return;

  const primaryAccountId = primaryAccount.value?.id;

  try {
    // Load subscriptions
    const subscriptionsData = await api.getSubscriptions({
      filter: {
        account_id: { _in: accountIds },
        status: { _eq: 'active' }
      },
      fields: ['*', 'service_id.*'],
    });

    currentSubscription.value = subscriptionsData.find(
      s => s.account_id === primaryAccountId
    ) || subscriptionsData[0] || null;
  } catch (e) {
    console.error('Failed to load subscriptions:', e);
  }

  try {
    // Load invoices
    const invoicesData = await api.getInvoices({
      filter: {
        account_id: { _in: accountIds },
        status: { _in: ['issued', 'overdue'] }
      },
      limit: 5,
    });
    unpaidInvoices.value = invoicesData;
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoadingInvoices.value = false;
  }
});
</script>
