<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/invoices" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ invoice?.invoice_number || 'Загрузка...' }}
      </h1>
      <StatusBadge v-if="invoice" :status="invoice.status" type="invoice" />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BaseCard v-for="i in 3" :key="i">
        <div class="animate-pulse space-y-4">
          <div class="h-6 w-32 bg-gray-200 rounded" />
          <div class="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </BaseCard>
    </div>

    <div v-else-if="invoice">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Сумма</p>
          <BalanceDisplay :amount="invoice.amount" size="xl" />
        </BaseCard>
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Срок оплаты</p>
          <p
            class="text-2xl font-bold"
            :class="isOverdue ? 'text-accent-pink' : 'text-gray-900'"
          >
            {{ invoice.due_date ? formatDate(invoice.due_date) : '—' }}
            <span v-if="isOverdue" class="text-sm font-normal">(просрочен)</span>
          </p>
        </BaseCard>
        <BaseCard>
          <p class="text-sm text-gray-500 mb-1">Период</p>
          <p class="text-2xl font-bold text-gray-900">
            <template v-if="invoice.period_start && invoice.period_end">
              {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
            </template>
            <template v-else>—</template>
          </p>
        </BaseCard>
      </div>

      <!-- Actions -->
      <BaseCard class="mb-6">
        <div class="flex flex-wrap gap-3">
          <BaseButton
            v-if="invoice.status === 'draft'"
            variant="primary"
            @click="handleIssue"
          >
            Выставить счёт
          </BaseButton>
          <BaseButton
            v-if="invoice.status === 'issued' || invoice.status === 'overdue'"
            variant="secondary"
            @click="handleMarkPaid"
          >
            Отметить оплаченным
          </BaseButton>
          <BaseButton
            v-if="invoice.status !== 'paid' && invoice.status !== 'cancelled'"
            variant="danger"
            @click="handleCancel"
          >
            Отменить
          </BaseButton>
          <BaseButton variant="ghost" @click="showEditModal = true">
            Редактировать
          </BaseButton>
        </div>
      </BaseCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Invoice Info -->
        <BaseCard title="Информация о счёте">
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">Номер счёта</dt>
              <dd class="font-medium">{{ invoice.invoice_number }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Учётная запись</dt>
              <dd class="font-medium">
                <NuxtLink
                  :to="`/accounts/${invoice.account_id}`"
                  class="text-primary-500 hover:text-primary-600"
                >
                  {{ invoice.account_id }}
                </NuxtLink>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Статус</dt>
              <dd><StatusBadge :status="invoice.status" type="invoice" /></dd>
            </div>
            <div v-if="invoice.description" class="flex justify-between">
              <dt class="text-gray-500">Описание</dt>
              <dd class="font-medium text-right max-w-xs">{{ invoice.description }}</dd>
            </div>
          </dl>
        </BaseCard>

        <!-- Dates -->
        <BaseCard title="Даты">
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">Создан</dt>
              <dd class="font-medium">{{ formatDateTime(invoice.date_created) }}</dd>
            </div>
            <div v-if="invoice.issued_at" class="flex justify-between">
              <dt class="text-gray-500">Выставлен</dt>
              <dd class="font-medium">{{ formatDateTime(invoice.issued_at) }}</dd>
            </div>
            <div v-if="invoice.due_date" class="flex justify-between">
              <dt class="text-gray-500">Срок оплаты</dt>
              <dd class="font-medium" :class="isOverdue ? 'text-accent-pink' : ''">
                {{ formatDate(invoice.due_date) }}
              </dd>
            </div>
            <div v-if="invoice.paid_at" class="flex justify-between">
              <dt class="text-gray-500">Оплачен</dt>
              <dd class="font-medium text-secondary-500">{{ formatDateTime(invoice.paid_at) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Обновлён</dt>
              <dd class="font-medium">{{ formatDateTime(invoice.date_updated) }}</dd>
            </div>
          </dl>
        </BaseCard>

        <!-- Payment History -->
        <BaseCard v-if="relatedPayments.length > 0" title="Связанные платежи" class="lg:col-span-2">
          <div class="space-y-2">
            <div
              v-for="payment in relatedPayments"
              :key="payment.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatPaymentProvider(payment.provider) }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatDateTime(payment.date_created) }}</p>
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
    </div>

    <BaseAlert v-else variant="error" title="Ошибка">
      Счёт не найден
    </BaseAlert>

    <!-- Edit Modal -->
    <BaseModal v-model:is-open="showEditModal" title="Редактировать счёт">
      <div class="space-y-4">
        <BaseInput
          v-model="editForm.description"
          label="Описание"
          placeholder="Описание счёта"
        />
        <BaseInput
          v-model="editForm.due_date"
          type="date"
          label="Срок оплаты"
        />
        <BaseInput
          v-model="editForm.amount"
          type="number"
          label="Сумма (рубли)"
          placeholder="1000.00"
        />
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showEditModal = false">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" :loading="isSubmitting" @click="submitEdit">
          Сохранить
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
  BalanceDisplay,
  StatusBadge,
  formatDate,
  formatDateTime,
  formatMoney,
  formatPaymentProvider,
} from '@pg19/ui';
import type { Invoice, Payment } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const api = useApi();

const invoice = ref<Invoice | null>(null);
const relatedPayments = ref<Payment[]>([]);
const isLoading = ref(true);
const showEditModal = ref(false);
const isSubmitting = ref(false);

const editForm = reactive({
  description: '',
  due_date: '',
  amount: '',
});

const isOverdue = computed(() => {
  if (!invoice.value) return false;
  if (invoice.value.status === 'paid' || invoice.value.status === 'cancelled') return false;
  if (!invoice.value.due_date) return false;
  return new Date(invoice.value.due_date) < new Date();
});

async function handleIssue() {
  if (!invoice.value) return;
  try {
    await api.updateInvoice(invoice.value.id, {
      status: 'issued',
      issued_at: new Date().toISOString(),
    });
    invoice.value.status = 'issued';
    invoice.value.issued_at = new Date().toISOString();
  } catch (e) {
    console.error('Failed to issue invoice:', e);
  }
}

async function handleMarkPaid() {
  if (!invoice.value) return;
  try {
    await api.updateInvoice(invoice.value.id, {
      status: 'paid',
      paid_at: new Date().toISOString(),
    });
    invoice.value.status = 'paid';
    invoice.value.paid_at = new Date().toISOString();
  } catch (e) {
    console.error('Failed to mark invoice as paid:', e);
  }
}

async function handleCancel() {
  if (!invoice.value) return;
  try {
    await api.updateInvoice(invoice.value.id, { status: 'cancelled' });
    invoice.value.status = 'cancelled';
  } catch (e) {
    console.error('Failed to cancel invoice:', e);
  }
}

async function submitEdit() {
  if (!invoice.value) return;

  isSubmitting.value = true;
  try {
    const updateData: Partial<Invoice> = {};

    if (editForm.description !== invoice.value.description) {
      updateData.description = editForm.description || null;
    }

    if (editForm.due_date) {
      updateData.due_date = editForm.due_date;
    }

    if (editForm.amount) {
      updateData.amount = Math.round(parseFloat(editForm.amount) * 100);
    }

    await api.updateInvoice(invoice.value.id, updateData);
    invoice.value = await api.getInvoice(invoice.value.id) as unknown as Invoice;
    showEditModal.value = false;
  } catch (e) {
    console.error('Failed to update invoice:', e);
  } finally {
    isSubmitting.value = false;
  }
}

function populateEditForm() {
  if (!invoice.value) return;
  editForm.description = invoice.value.description || '';
  editForm.due_date = invoice.value.due_date || '';
  editForm.amount = invoice.value.amount ? (invoice.value.amount / 100).toString() : '';
}

watch(showEditModal, (isOpen) => {
  if (isOpen) {
    populateEditForm();
  }
});

onMounted(async () => {
  try {
    const id = route.params.id as string;
    invoice.value = await api.getInvoice(id) as unknown as Invoice;

    // Load related payments
    if (invoice.value?.account_id) {
      const payments = await api.getPayments({
        filter: { account_id: { _eq: invoice.value.account_id } },
        sort: ['-date_created'],
        limit: 10,
      }) as unknown as Payment[];
      relatedPayments.value = payments;
    }
  } catch (e) {
    console.error('Failed to load invoice:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
