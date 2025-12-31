<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/users" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ user ? formatFullName(user) : 'Загрузка...' }}
      </h1>
      <StatusBadge v-if="user" :status="user.status" type="user" />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BaseCard v-for="i in 4" :key="i">
        <div class="animate-pulse space-y-4">
          <div class="h-6 w-32 bg-gray-200 rounded" />
          <div class="space-y-2">
            <div class="h-4 w-full bg-gray-200 rounded" />
            <div class="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Data -->
      <BaseCard title="Персональные данные">
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-gray-500">ID</dt>
            <dd class="font-medium">{{ user.id }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">ФИО</dt>
            <dd class="font-medium">{{ formatFullName(user) }}</dd>
          </div>
          <div v-if="user.phone" class="flex justify-between">
            <dt class="text-gray-500">Телефон</dt>
            <dd class="font-medium">{{ formatPhone(user.phone) }}</dd>
          </div>
          <div v-if="user.email" class="flex justify-between">
            <dt class="text-gray-500">Email</dt>
            <dd class="font-medium">{{ user.email }}</dd>
          </div>
          <div v-if="user.telegram_username" class="flex justify-between">
            <dt class="text-gray-500">Telegram</dt>
            <dd class="font-medium">@{{ user.telegram_username }}</dd>
          </div>
          <div v-if="user.passport_series || user.passport_number" class="flex justify-between">
            <dt class="text-gray-500">Паспорт</dt>
            <dd class="font-medium">{{ user.passport_series }} {{ user.passport_number }}</dd>
          </div>
        </dl>
      </BaseCard>

      <!-- Registration Address -->
      <BaseCard title="Адрес регистрации">
        <p v-if="registrationAddress" class="text-gray-900">{{ registrationAddress }}</p>
        <p v-else class="text-gray-500">Не указан</p>
      </BaseCard>

      <!-- Account (includes contract data) -->
      <BaseCard title="Лицевой счёт / Договор" class="lg:col-span-2">
        <div v-if="!user.account" class="text-center py-8 text-gray-500">
          Нет лицевого счёта
        </div>
        <div v-else class="space-y-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <!-- Contract info header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h4 class="font-medium text-gray-900">
                  Договор #{{ user.account.contract_number }}
                </h4>
                <StatusBadge :status="user.account.contract_status || 'active'" type="contract" />
              </div>
              <span v-if="user.account.start_date" class="text-sm text-gray-500">
                от {{ formatDate(user.account.start_date) }}
              </span>
            </div>

            <p v-if="accountAddress" class="text-sm text-gray-600 mb-3">
              {{ accountAddress }}
            </p>

            <!-- Account details -->
            <div class="mt-4 bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <NuxtLink
                  :to="`/accounts/${user.account.id}`"
                  class="flex items-center gap-3 hover:text-primary-600"
                >
                  <span class="font-medium">Счёт #{{ user.account.contract_number }}-1</span>
                  <StatusBadge :status="user.account.status" type="account" />
                </NuxtLink>
                <BalanceDisplay :amount="user.account.balance" />
              </div>
              <div v-if="user.account.credit_limit" class="mt-2 text-sm text-gray-500">
                Кредитный лимит: {{ formatMoney(user.account.credit_limit) }}
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Activity -->
      <BaseCard title="Информация" class="lg:col-span-2">
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt class="text-sm text-gray-500">Дата регистрации</dt>
            <dd class="font-medium">{{ formatDate(user.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Последнее обновление</dt>
            <dd class="font-medium">{{ formatDateTime(user.date_updated) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Статус договора</dt>
            <dd class="font-medium">{{ user.account?.contract_status || '—' }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Статус счёта</dt>
            <dd class="font-medium">{{ user.account?.status || '—' }}</dd>
          </div>
        </dl>
      </BaseCard>
    </div>

    <BaseAlert v-else variant="error" title="Ошибка">
      Клиент не найден
    </BaseAlert>
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseAlert,
  StatusBadge,
  BalanceDisplay,
  formatFullName,
  formatPhone,
  formatDate,
  formatDateTime,
  formatAddress,
  formatMoney,
} from '@pg19/ui';
import type { User, Account } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const api = useApi();

// User with account (1:1 relationship)
const user = ref<(User & { account?: Account }) | null>(null);
const isLoading = ref(true);

const registrationAddress = computed(() => {
  if (!user.value) return '';
  return formatAddress({
    city: user.value.reg_city,
    street: user.value.reg_street,
    building: user.value.reg_building,
    apartment: user.value.reg_apartment,
  });
});

const accountAddress = computed(() => {
  const account = user.value?.account;
  if (!account) return '';
  if (account.address_full) return account.address_full;
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
});

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    user.value = await api.getUserWithAccount(id);
  } catch (e) {
    console.error('Failed to load user:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
