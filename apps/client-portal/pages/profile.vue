<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Профиль</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Data -->
      <BaseCard title="Персональные данные">
        <dl class="space-y-4">
          <div>
            <dt class="text-sm text-gray-500">ФИО</dt>
            <dd class="text-gray-900 font-medium">{{ fullName }}</dd>
          </div>
          <div v-if="authStore.person?.phone">
            <dt class="text-sm text-gray-500">Телефон</dt>
            <dd class="text-gray-900">{{ formatPhone(authStore.person.phone) }}</dd>
          </div>
          <div v-if="authStore.person?.email">
            <dt class="text-sm text-gray-500">Email</dt>
            <dd class="text-gray-900">{{ authStore.person.email }}</dd>
          </div>
          <div v-if="authStore.person?.telegram_username">
            <dt class="text-sm text-gray-500">Telegram</dt>
            <dd class="text-gray-900">@{{ authStore.person.telegram_username }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Номер абонента</dt>
            <dd class="text-gray-900">{{ authStore.person?.customer_number }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Статус</dt>
            <dd>
              <StatusBadge :status="authStore.person?.status || 'active'" type="person" />
            </dd>
          </div>
        </dl>
      </BaseCard>

      <!-- Contract Info -->
      <BaseCard title="Договор">
        <dl class="space-y-4">
          <div>
            <dt class="text-sm text-gray-500">Номер договора</dt>
            <dd class="text-gray-900 font-medium">{{ authStore.contract?.contract_number }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Статус</dt>
            <dd>
              <StatusBadge :status="authStore.contract?.status || 'active'" type="contract" />
            </dd>
          </div>
          <div v-if="authStore.contract?.start_date">
            <dt class="text-sm text-gray-500">Дата заключения</dt>
            <dd class="text-gray-900">{{ formatDate(authStore.contract.start_date) }}</dd>
          </div>
          <div v-if="contractAddress">
            <dt class="text-sm text-gray-500">Адрес по договору</dt>
            <dd class="text-gray-900">{{ contractAddress }}</dd>
          </div>
        </dl>
      </BaseCard>

      <!-- Service Address -->
      <BaseCard title="Адрес подключения">
        <dl class="space-y-4">
          <div v-if="serviceAddress">
            <dt class="text-sm text-gray-500">Адрес</dt>
            <dd class="text-gray-900">{{ serviceAddress }}</dd>
          </div>
          <div v-if="authStore.primaryAccount?.address_entrance">
            <dt class="text-sm text-gray-500">Подъезд</dt>
            <dd class="text-gray-900">{{ authStore.primaryAccount.address_entrance }}</dd>
          </div>
          <div v-if="authStore.primaryAccount?.address_floor">
            <dt class="text-sm text-gray-500">Этаж</dt>
            <dd class="text-gray-900">{{ authStore.primaryAccount.address_floor }}</dd>
          </div>
          <div v-if="authStore.primaryAccount?.address_intercom">
            <dt class="text-sm text-gray-500">Домофон</dt>
            <dd class="text-gray-900">{{ authStore.primaryAccount.address_intercom }}</dd>
          </div>
          <div v-if="!serviceAddress && !authStore.primaryAccount?.address_entrance">
            <dd class="text-gray-500">Адрес не указан</dd>
          </div>
        </dl>
      </BaseCard>

      <!-- Account Info -->
      <BaseCard title="Учётная запись">
        <dl class="space-y-4">
          <div>
            <dt class="text-sm text-gray-500">Номер счёта</dt>
            <dd class="text-gray-900 font-medium">{{ authStore.primaryAccount?.account_number }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Баланс</dt>
            <dd>
              <BalanceDisplay :amount="authStore.currentBalance" />
            </dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Статус</dt>
            <dd>
              <StatusBadge :status="authStore.primaryAccount?.status || 'active'" type="account" />
            </dd>
          </div>
          <div v-if="authStore.primaryAccount?.credit_limit">
            <dt class="text-sm text-gray-500">Кредитный лимит</dt>
            <dd class="text-gray-900">{{ formatMoney(authStore.primaryAccount.credit_limit) }}</dd>
          </div>
          <div v-if="authStore.primaryAccount?.next_charge_date">
            <dt class="text-sm text-gray-500">Следующее списание</dt>
            <dd class="text-gray-900">{{ formatDate(authStore.primaryAccount.next_charge_date) }}</dd>
          </div>
        </dl>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BalanceDisplay, StatusBadge, formatDate, formatPhone, formatMoney, formatFullName, formatAddress } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();

const fullName = computed(() => {
  if (!authStore.person) return '';
  return formatFullName(authStore.person);
});

const contractAddress = computed(() => {
  if (!authStore.contract) return '';
  if (authStore.contract.address_full) return authStore.contract.address_full;
  return formatAddress({
    city: authStore.contract.address_city,
    street: authStore.contract.address_street,
    building: authStore.contract.address_building,
    apartment: authStore.contract.address_apartment,
  });
});

const serviceAddress = computed(() => {
  const account = authStore.primaryAccount;
  if (!account) return '';
  if (account.address_full) return account.address_full;
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
});
</script>
