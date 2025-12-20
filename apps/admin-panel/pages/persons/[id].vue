<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/persons" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ person ? formatFullName(person) : 'Загрузка...' }}
      </h1>
      <StatusBadge v-if="person" :status="person.status" type="person" />
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

    <div v-else-if="person" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Data -->
      <BaseCard title="Персональные данные">
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-gray-500">Номер клиента</dt>
            <dd class="font-medium">{{ person.customer_number }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">ФИО</dt>
            <dd class="font-medium">{{ formatFullName(person) }}</dd>
          </div>
          <div v-if="person.phone" class="flex justify-between">
            <dt class="text-gray-500">Телефон</dt>
            <dd class="font-medium">{{ formatPhone(person.phone) }}</dd>
          </div>
          <div v-if="person.email" class="flex justify-between">
            <dt class="text-gray-500">Email</dt>
            <dd class="font-medium">{{ person.email }}</dd>
          </div>
          <div v-if="person.telegram_username" class="flex justify-between">
            <dt class="text-gray-500">Telegram</dt>
            <dd class="font-medium">@{{ person.telegram_username }}</dd>
          </div>
          <div v-if="person.passport_series || person.passport_number" class="flex justify-between">
            <dt class="text-gray-500">Паспорт</dt>
            <dd class="font-medium">{{ person.passport_series }} {{ person.passport_number }}</dd>
          </div>
        </dl>
      </BaseCard>

      <!-- Registration Address -->
      <BaseCard title="Адрес регистрации">
        <p v-if="registrationAddress" class="text-gray-900">{{ registrationAddress }}</p>
        <p v-else class="text-gray-500">Не указан</p>
      </BaseCard>

      <!-- Contracts -->
      <BaseCard title="Договоры" class="lg:col-span-2">
        <div v-if="!person.contracts?.length" class="text-center py-8 text-gray-500">
          Нет договоров
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="contract in person.contracts"
            :key="contract.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h4 class="font-medium text-gray-900">{{ contract.contract_number }}</h4>
                <StatusBadge :status="contract.status" type="contract" />
              </div>
              <span v-if="contract.start_date" class="text-sm text-gray-500">
                от {{ formatDate(contract.start_date) }}
              </span>
            </div>

            <p v-if="getContractAddress(contract)" class="text-sm text-gray-600 mb-3">
              {{ getContractAddress(contract) }}
            </p>

            <!-- Accounts under this contract -->
            <div v-if="contract.accounts?.length" class="mt-4 space-y-2">
              <p class="text-sm font-medium text-gray-700">Учётные записи:</p>
              <div
                v-for="account in contract.accounts"
                :key="account.id"
                class="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <NuxtLink
                  :to="`/accounts/${account.id}`"
                  class="flex items-center gap-3 hover:text-primary-600"
                >
                  <span class="font-medium">{{ account.account_number }}</span>
                  <StatusBadge :status="account.status" type="account" />
                </NuxtLink>
                <BalanceDisplay :amount="account.balance" />
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
            <dd class="font-medium">{{ formatDate(person.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Последнее обновление</dt>
            <dd class="font-medium">{{ formatDateTime(person.date_updated) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Всего договоров</dt>
            <dd class="font-medium">{{ person.contracts?.length || 0 }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Учётных записей</dt>
            <dd class="font-medium">{{ totalAccounts }}</dd>
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
} from '@pg19/ui';
import type { Person, Contract } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const api = useApi();

const person = ref<Person | null>(null);
const isLoading = ref(true);

const registrationAddress = computed(() => {
  if (!person.value) return '';
  return formatAddress({
    city: person.value.reg_city,
    street: person.value.reg_street,
    building: person.value.reg_building,
    apartment: person.value.reg_apartment,
  });
});

const totalAccounts = computed(() => {
  if (!person.value?.contracts) return 0;
  return person.value.contracts.reduce((sum, c) => sum + (c.accounts?.length || 0), 0);
});

function getContractAddress(contract: Contract): string {
  if (contract.address_full) return contract.address_full;
  return formatAddress({
    city: contract.address_city,
    street: contract.address_street,
    building: contract.address_building,
    apartment: contract.address_apartment,
  });
}

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    person.value = await api.getPerson(id) as unknown as Person;
  } catch (e) {
    console.error('Failed to load person:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
