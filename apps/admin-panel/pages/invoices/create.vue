<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/invoices" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Создать счёт</h1>
    </div>

    <BaseCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Account Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Учётная запись <span class="text-accent-pink">*</span>
          </label>
          <div class="flex gap-2">
            <BaseInput
              v-model="searchAccount"
              placeholder="Поиск по номеру учётной записи..."
              class="flex-1"
              @input="handleAccountSearch"
            />
          </div>
          <div v-if="accountResults.length > 0" class="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
            <button
              v-for="account in accountResults"
              :key="account.id"
              type="button"
              class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              @click="selectAccount(account)"
            >
              <div>
                <p class="font-medium text-gray-900">Счёт #{{ account.contract_number }}-1</p>
                <p class="text-sm text-gray-500">{{ getAccountAddress(account) || 'Адрес не указан' }}</p>
              </div>
              <StatusBadge :status="account.status" type="account" />
            </button>
          </div>
          <div v-if="selectedAccount" class="mt-2 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
            <div>
              <p class="font-medium text-primary-700">Счёт #{{ selectedAccount.contract_number }}-1</p>
              <p class="text-sm text-primary-600">Баланс: {{ formatMoney(selectedAccount.balance) }}</p>
            </div>
            <button type="button" class="text-primary-500 hover:text-primary-700" @click="clearAccount">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Amount -->
        <BaseInput
          v-model="form.amount"
          type="number"
          step="0.01"
          label="Сумма (рубли)"
          placeholder="1000.00"
          required
        />

        <!-- Description -->
        <BaseInput
          v-model="form.description"
          label="Описание"
          placeholder="Описание счёта"
        />

        <!-- Period -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.period_start"
            type="text"
            label="Начало периода (ГГГГ-ММ-ДД)"
            placeholder="2024-01-01"
          />
          <BaseInput
            v-model="form.period_end"
            type="text"
            label="Конец периода (ГГГГ-ММ-ДД)"
            placeholder="2024-01-31"
          />
        </div>

        <!-- Due Date -->
        <BaseInput
          v-model="form.due_date"
          type="text"
          label="Срок оплаты (ГГГГ-ММ-ДД)"
          placeholder="2024-02-15"
        />

        <!-- Status -->
        <BaseSelect
          v-model="form.status"
          :options="statusOptions"
          label="Статус"
        />

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <BaseButton type="button" variant="ghost" @click="$router.push('/invoices')">
            Отмена
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isSubmitting" :disabled="!isFormValid">
            Создать счёт
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import {
  BaseCard,
  BaseButton,
  BaseInput,
  BaseSelect,
  StatusBadge,
  formatMoney,
  formatAddress,
} from '@pg19/ui';
import type { Account, Invoice } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const api = useApi();

const searchAccount = ref('');
const accountResults = ref<Account[]>([]);
const selectedAccount = ref<Account | null>(null);
const isSubmitting = ref(false);

const form = reactive({
  amount: '',
  description: '',
  period_start: '',
  period_end: '',
  due_date: '',
  status: 'draft',
});

const statusOptions = [
  { value: 'draft', label: 'Черновик' },
  { value: 'issued', label: 'Выставлен' },
];

const isFormValid = computed(() => {
  return selectedAccount.value && form.amount && parseFloat(form.amount) > 0;
});

function getAccountAddress(account: Account): string {
  if (account.address_full) return account.address_full;
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
}

let searchTimeout: ReturnType<typeof setTimeout>;

function handleAccountSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (!searchAccount.value || searchAccount.value.length < 2) {
      accountResults.value = [];
      return;
    }

    try {
      const results = await api.getAccounts({
        search: searchAccount.value,
        limit: 10,
      }) as unknown as Account[];
      accountResults.value = results;
    } catch (e) {
      console.error('Failed to search accounts:', e);
    }
  }, 300);
}

function selectAccount(account: Account) {
  selectedAccount.value = account;
  searchAccount.value = '';
  accountResults.value = [];
}

function clearAccount() {
  selectedAccount.value = null;
}

async function handleSubmit() {
  if (!selectedAccount.value || !form.amount) return;

  isSubmitting.value = true;

  try {
    const invoiceData: Partial<Invoice> = {
      account_id: selectedAccount.value.id,
      amount: Math.round(parseFloat(form.amount) * 100),
      description: form.description || null,
      period_start: form.period_start || null,
      period_end: form.period_end || null,
      due_date: form.due_date || null,
      status: form.status as Invoice['status'],
      issued_at: form.status === 'issued' ? new Date().toISOString() : null,
    };

    const result = await api.createInvoice(invoiceData);
    const newInvoice = result as unknown as { id: string };

    router.push(`/invoices/${newInvoice.id}`);
  } catch (e) {
    console.error('Failed to create invoice:', e);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
