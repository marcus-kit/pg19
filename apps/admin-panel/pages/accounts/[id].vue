<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/accounts" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ account?.account_number || 'Загрузка...' }}
      </h1>
      <StatusBadge v-if="account" :status="account.status" type="account" />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard v-for="i in 3" :key="i">
        <div class="animate-pulse space-y-4">
          <div class="h-6 w-32 bg-gray-200 rounded" />
          <div class="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </BaseCard>
    </div>

    <div v-else-if="account">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Баланс</p>
          <BalanceDisplay :amount="account.balance" size="xl" />
        </BaseCard>
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Кредитный лимит</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatMoney(account.credit_limit) }}</p>
        </BaseCard>
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Следующее списание</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ account.next_charge_date ? formatDate(account.next_charge_date) : '—' }}
          </p>
        </BaseCard>
      </div>

      <!-- Actions -->
      <BaseCard class="mb-6">
        <div class="flex flex-wrap gap-3">
          <BaseButton variant="primary" @click="showCorrectionModal = true">
            Корректировка баланса
          </BaseButton>
          <BaseButton
            v-if="account.status === 'active'"
            variant="danger"
            @click="handleBlock"
          >
            Заблокировать
          </BaseButton>
          <BaseButton
            v-else-if="account.status === 'blocked'"
            variant="secondary"
            @click="handleUnblock"
          >
            Разблокировать
          </BaseButton>
        </div>
      </BaseCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Account Info -->
        <BaseCard title="Информация">
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">Адрес</dt>
              <dd class="font-medium text-right">{{ accountAddress || '—' }}</dd>
            </div>
            <div v-if="account.address_entrance" class="flex justify-between">
              <dt class="text-gray-500">Подъезд</dt>
              <dd class="font-medium">{{ account.address_entrance }}</dd>
            </div>
            <div v-if="account.address_floor" class="flex justify-between">
              <dt class="text-gray-500">Этаж</dt>
              <dd class="font-medium">{{ account.address_floor }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Дата создания</dt>
              <dd class="font-medium">{{ formatDate(account.date_created) }}</dd>
            </div>
          </dl>
        </BaseCard>

        <!-- Subscriptions -->
        <BaseCard title="Подписки">
          <div v-if="!account.subscriptions?.length" class="text-center py-4 text-gray-500">
            Нет активных подписок
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="sub in account.subscriptions"
              :key="sub.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ sub.service?.name || 'Тариф' }}</p>
                <StatusBadge :status="sub.status" type="subscription" />
              </div>
              <p class="font-medium text-gray-900">
                {{ formatMoney(sub.custom_price ?? (sub.service?.price_monthly || 0) * 100) }}/мес
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Recent Transactions -->
        <BaseCard title="Последние операции" class="lg:col-span-2">
          <div v-if="!account.transactions?.length" class="text-center py-8 text-gray-500">
            Нет операций
          </div>
          <div v-else>
            <TransactionRow
              v-for="tx in account.transactions.slice(0, 10)"
              :key="tx.id"
              :transaction="tx"
            />
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseAlert v-else variant="error" title="Ошибка">
      Учётная запись не найдена
    </BaseAlert>

    <!-- Correction Modal -->
    <BaseModal v-model:is-open="showCorrectionModal" title="Корректировка баланса">
      <div class="space-y-4">
        <BaseSelect
          v-model="correction.type"
          :options="correctionTypes"
          label="Тип корректировки"
        />
        <BaseInput
          v-model="correction.amount"
          type="number"
          label="Сумма (рубли)"
          placeholder="100.00"
        />
        <BaseInput
          v-model="correction.description"
          label="Описание"
          placeholder="Причина корректировки"
        />
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showCorrectionModal = false">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" :loading="isSubmitting" @click="submitCorrection">
          Применить
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseButton,
  BaseAlert,
  BaseModal,
  BaseInput,
  BaseSelect,
  BalanceDisplay,
  StatusBadge,
  TransactionRow,
  formatMoney,
  formatDate,
  formatAddress,
} from '@pg19/ui';
import type { Account } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const api = useApi();

const account = ref<Account | null>(null);
const isLoading = ref(true);
const showCorrectionModal = ref(false);
const isSubmitting = ref(false);

const correction = reactive({
  type: 'correction',
  amount: '',
  description: '',
});

const correctionTypes = [
  { value: 'correction', label: 'Корректировка' },
  { value: 'bonus', label: 'Бонус' },
];

const accountAddress = computed(() => {
  if (!account.value) return '';
  if (account.value.address_full) return account.value.address_full;
  return formatAddress({
    city: account.value.address_city,
    street: account.value.address_street,
    building: account.value.address_building,
    apartment: account.value.address_apartment,
  });
});

async function handleBlock() {
  if (!account.value) return;
  try {
    await api.updateAccount(account.value.id, { status: 'blocked' });
    account.value.status = 'blocked';
  } catch (e) {
    console.error('Failed to block account:', e);
  }
}

async function handleUnblock() {
  if (!account.value) return;
  try {
    await api.updateAccount(account.value.id, { status: 'active' });
    account.value.status = 'active';
  } catch (e) {
    console.error('Failed to unblock account:', e);
  }
}

async function submitCorrection() {
  if (!account.value || !correction.amount) return;

  isSubmitting.value = true;
  try {
    const amount = Math.round(parseFloat(correction.amount) * 100);
    await api.createTransaction({
      account_id: account.value.id,
      type: correction.type as 'correction' | 'bonus',
      amount,
      description: correction.description || null,
      balance_after: account.value.balance + amount,
    });

    // Reload account
    account.value = await api.getAccount(account.value.id) as unknown as Account;
    showCorrectionModal.value = false;
    correction.amount = '';
    correction.description = '';
  } catch (e) {
    console.error('Failed to create correction:', e);
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  try {
    const id = route.params.id as string;
    account.value = await api.getAccount(id) as unknown as Account;
  } catch (e) {
    console.error('Failed to load account:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
