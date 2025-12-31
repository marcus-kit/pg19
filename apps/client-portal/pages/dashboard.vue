<template>
  <div class="space-y-6">
    <!-- Cooperative News Section -->
    <NewsSection />

    <!-- Connection Status Card -->
    <BaseCard v-if="account" class="border-l-4" :class="connectionStatusBorderClass">
      <div class="flex items-center gap-4 mb-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="connectionStatusBgClass"
        >
          <WifiIcon v-if="isConnected" class="w-6 h-6 text-secondary-600" />
          <WifiOffIcon v-else class="w-6 h-6 text-red-600" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
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
      </div>

      <!-- Subscriptions List -->
      <div v-if="subscriptions.length > 0" class="space-y-2">
        <div
          v-for="sub in subscriptions"
          :key="sub.id"
          class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ sub.service?.name || 'Услуга' }}
            </p>
          </div>
          <div class="ml-4 text-sm font-semibold text-gray-700">
            {{ formatMoney(getSubscriptionPrice(sub)) }}<span class="text-xs font-normal text-gray-500">/мес</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-200">
          <span class="text-sm font-medium text-gray-600">Итого в месяц:</span>
          <span class="text-lg font-bold text-gray-900">{{ formatMoney(totalMonthlyPrice) }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">
        Нет активных услуг
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
import NewsSection from '~/components/news/NewsSection.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// Data
const subscriptions = ref<Subscription[]>([]);
const unpaidInvoices = ref<Invoice[]>([]);
const isLoadingInvoices = ref(true);
const openTicketsCount = ref(0);
const hasAutopay = ref(false);

// Computed
const account = computed(() => authStore.account);

// Helper function to get subscription price
function getSubscriptionPrice(sub: Subscription): number {
  if (sub.custom_price !== null) return sub.custom_price;
  return (sub.service?.price_monthly || 0) * 100;
}

// Total monthly price for all subscriptions
const totalMonthlyPrice = computed(() => {
  return subscriptions.value.reduce((sum, sub) => sum + getSubscriptionPrice(sub), 0);
});

const monthlyCharge = computed(() => totalMonthlyPrice.value);

const daysRemaining = computed(() => {
  if (authStore.currentBalance <= 0 || totalMonthlyPrice.value <= 0) return null;
  const dailyRate = totalMonthlyPrice.value / 30;
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
  if (!account.value) return 'bg-gray-100';
  return account.value.status === 'active'
    ? 'bg-secondary-100'
    : 'bg-red-100';
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
  return authStore.currentBalance < totalMonthlyPrice.value && authStore.currentBalance > 0;
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
  const accountIds = authStore.account ? [authStore.account.id] : [];
  if (accountIds.length === 0) return;

  const accountId = account.value?.id;

  try {
    // Load all active subscriptions
    const subs = await api.getSubscriptions(accountId!);
    // Sort by price descending (main services first)
    subscriptions.value = subs
      .filter(s => s.status === 'active')
      .sort((a, b) => {
        const priceA = a.custom_price ?? (a.service?.price_monthly || 0) * 100;
        const priceB = b.custom_price ?? (b.service?.price_monthly || 0) * 100;
        return priceB - priceA;
      });
  } catch (e) {
    console.error('Failed to load subscriptions:', e);
  }

  try {
    // Load invoices for all accounts
    const allInvoices: typeof unpaidInvoices.value = [];
    for (const accountId of accountIds) {
      const { data } = await api.getInvoices(accountId, { limit: 5 });
      allInvoices.push(...data.filter(inv => inv.status === 'issued' || inv.status === 'overdue'));
    }
    unpaidInvoices.value = allInvoices.slice(0, 5);
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoadingInvoices.value = false;
  }
});
</script>
