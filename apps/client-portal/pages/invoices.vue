<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Счета</h1>

      <!-- Period Filter -->
      <div class="flex items-center gap-2">
        <select
          v-model="selectedYear"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-red-50 rounded-lg">
            <ExclamationIcon class="w-5 h-5 text-accent-pink" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(unpaidAmount) }}</p>
            <p class="text-xs text-gray-500">К оплате</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-orange-50 rounded-lg">
            <ClockIcon class="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ overdueCount }}</p>
            <p class="text-xs text-gray-500">Просрочено</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-50 rounded-lg">
            <CheckCircleIcon class="w-5 h-5 text-secondary-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(paidAmount) }}</p>
            <p class="text-xs text-gray-500">Оплачено в {{ selectedYear }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 rounded-lg">
            <DocumentIcon class="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ invoices.length }}</p>
            <p class="text-xs text-gray-500">Всего счетов</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex gap-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === tab.value
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            :class="[
              'ml-2 px-2 py-0.5 text-xs font-medium rounded-full',
              activeTab === tab.value
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Invoice List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="divide-y divide-gray-100">
        <div v-for="i in 5" :key="i" class="p-4 animate-pulse">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="flex-1 space-y-2">
              <div class="h-5 w-32 bg-gray-200 rounded" />
              <div class="h-4 w-48 bg-gray-200 rounded" />
              <div class="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div class="flex items-center gap-4">
              <div class="h-6 w-24 bg-gray-200 rounded" />
              <div class="h-8 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredInvoices.length === 0" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <DocumentIcon class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-600 font-medium">{{ emptyMessage }}</p>
        <p class="text-sm text-gray-400 mt-1">Выберите другой фильтр или период</p>
      </div>

      <!-- Invoice Items -->
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="invoice in paginatedInvoices"
          :key="invoice.id"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <!-- Invoice Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <span class="font-semibold text-gray-900">{{ invoice.invoice_number }}</span>
                <InvoiceStatusBadge :status="invoice.status" :is-overdue="isOverdue(invoice)" />
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span v-if="invoice.period_start && invoice.period_end" class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4" />
                  {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
                </span>
                <span v-if="invoice.description" class="truncate max-w-xs">
                  {{ invoice.description }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                <span>{{ invoice.issued_at ? `Выставлен: ${formatDate(invoice.issued_at)}` : `Создан: ${formatDate(invoice.date_created)}` }}</span>
                <span v-if="invoice.due_date" :class="isOverdue(invoice) ? 'text-accent-pink font-medium' : ''">
                  Срок: {{ formatDate(invoice.due_date) }}
                  <span v-if="daysUntilDue(invoice) !== null && daysUntilDue(invoice)! > 0" class="text-gray-400">
                    ({{ daysUntilDue(invoice) }} дн.)
                  </span>
                </span>
                <span v-if="invoice.paid_at">Оплачен: {{ formatDate(invoice.paid_at) }}</span>
              </div>
            </div>

            <!-- Amount & Actions -->
            <div class="flex items-center gap-4 lg:gap-6">
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ formatMoney(invoice.amount) }}</p>
              </div>

              <div class="flex items-center gap-2">
                <!-- Pay Button -->
                <BaseButton
                  v-if="invoice.status === 'issued' || invoice.status === 'overdue'"
                  variant="primary"
                  size="sm"
                  @click="payInvoice(invoice)"
                >
                  Оплатить
                </BaseButton>

                <!-- Download Button -->
                <button
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Скачать PDF"
                  @click="downloadInvoice(invoice)"
                >
                  <DownloadIcon class="w-5 h-5" />
                </button>

                <!-- Email Button -->
                <button
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Отправить на email"
                  @click="emailInvoice(invoice)"
                >
                  <EmailIcon class="w-5 h-5" />
                </button>

                <!-- Expand Button -->
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors lg:hidden"
                  @click="toggleInvoiceDetails(invoice.id)"
                >
                  <ChevronDownIcon
                    class="w-5 h-5 transition-transform"
                    :class="{ 'rotate-180': expandedInvoices.includes(invoice.id) }"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Expanded Details (Mobile) -->
          <div
            v-if="expandedInvoices.includes(invoice.id)"
            class="mt-4 pt-4 border-t border-gray-100 lg:hidden"
          >
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Статус</p>
                <p class="font-medium text-gray-900">{{ getStatusLabel(invoice.status) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Сумма</p>
                <p class="font-medium text-gray-900">{{ formatMoney(invoice.amount) }}</p>
              </div>
              <div v-if="invoice.period_start">
                <p class="text-gray-500">Период</p>
                <p class="font-medium text-gray-900">{{ formatDate(invoice.period_start!) }} — {{ formatDate(invoice.period_end!) }}</p>
              </div>
              <div v-if="invoice.due_date">
                <p class="text-gray-500">Срок оплаты</p>
                <p class="font-medium text-gray-900">{{ formatDate(invoice.due_date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredInvoices.length > perPage" class="px-4 py-3 border-t border-gray-100">
        <BasePagination
          v-model:current-page="currentPage"
          :total="filteredInvoices.length"
          :per-page="perPage"
        />
      </div>
    </div>

    <!-- Quick Pay Modal -->
    <Teleport to="body">
      <div
        v-if="selectedInvoice"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="selectedInvoice = null"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Оплата счёта</h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-lg"
              @click="selectedInvoice = null"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Счёт</span>
              <span class="font-medium text-gray-900">{{ selectedInvoice.invoice_number }}</span>
            </div>
            <div v-if="selectedInvoice.period_start" class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Период</span>
              <span class="text-gray-900">{{ formatDate(selectedInvoice.period_start!) }} — {{ formatDate(selectedInvoice.period_end!) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Сумма к оплате</span>
              <span class="text-xl font-bold text-primary-600">{{ formatMoney(selectedInvoice.amount) }}</span>
            </div>
          </div>

          <p class="text-sm text-gray-500 text-center mb-6">
            Выберите способ оплаты для перехода к платёжной форме
          </p>

          <div class="space-y-3">
            <button
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
              @click="processPayment('card')"
            >
              <div class="p-2 bg-primary-100 rounded-lg">
                <CardIcon class="w-6 h-6 text-primary-600" />
              </div>
              <div class="text-left flex-1">
                <p class="font-medium text-gray-900">Банковская карта</p>
                <p class="text-sm text-gray-500">Visa, Mastercard, МИР</p>
              </div>
              <ChevronRightIcon class="w-5 h-5 text-gray-400" />
            </button>

            <button
              class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
              @click="processPayment('sbp')"
            >
              <div class="p-2 bg-green-100 rounded-lg">
                <SbpIcon class="w-6 h-6 text-green-600" />
              </div>
              <div class="text-left flex-1">
                <p class="font-medium text-gray-900">СБП</p>
                <p class="text-sm text-gray-500">Система быстрых платежей</p>
              </div>
              <ChevronRightIcon class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Email Modal -->
    <Teleport to="body">
      <div
        v-if="emailModalInvoice"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="emailModalInvoice = null"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Отправить на email</h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-lg"
              @click="emailModalInvoice = null"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="text-gray-600 mb-4">
            Счёт <span class="font-medium">{{ emailModalInvoice.invoice_number }}</span> будет отправлен на указанный email
          </p>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email адрес</label>
            <input
              v-model="emailAddress"
              type="email"
              placeholder="example@mail.ru"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="flex gap-3">
            <BaseButton
              variant="ghost"
              class="flex-1"
              @click="emailModalInvoice = null"
            >
              Отмена
            </BaseButton>
            <BaseButton
              variant="primary"
              class="flex-1"
              :disabled="!isValidEmail"
              @click="sendEmail"
            >
              Отправить
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { BaseButton, BasePagination, formatDate } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Invoice, InvoiceStatus } from '@pg19/types';

// Icons
import ExclamationIcon from '~/components/icons/ExclamationIcon.vue';
import ClockIcon from '~/components/icons/ClockIcon.vue';
import CheckCircleIcon from '~/components/icons/CheckCircleIcon.vue';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import CalendarIcon from '~/components/icons/CalendarIcon.vue';
import DownloadIcon from '~/components/icons/DownloadIcon.vue';
import EmailIcon from '~/components/icons/EmailIcon.vue';
import ChevronDownIcon from '~/components/icons/ChevronDownIcon.vue';
import ChevronRightIcon from '~/components/icons/ChevronRightIcon.vue';
import CardIcon from '~/components/icons/CardIcon.vue';
import SbpIcon from '~/components/icons/SbpIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// State
const invoices = ref<Invoice[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const perPage = 10;
const activeTab = ref<'unpaid' | 'paid' | 'all'>('unpaid');
const selectedYear = ref(new Date().getFullYear());
const expandedInvoices = ref<number[]>([]);
const selectedInvoice = ref<Invoice | null>(null);
const emailModalInvoice = ref<Invoice | null>(null);
const emailAddress = ref('');

// Computed
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

const unpaidAmount = computed(() => {
  return invoices.value
    .filter(inv => inv.status === 'issued' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
});

const paidAmount = computed(() => {
  return invoices.value
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
});

const overdueCount = computed(() => {
  return invoices.value.filter(inv => isOverdue(inv)).length;
});

const tabs = computed(() => [
  {
    value: 'unpaid' as const,
    label: 'К оплате',
    count: invoices.value.filter(inv => inv.status === 'issued' || inv.status === 'overdue').length,
  },
  {
    value: 'paid' as const,
    label: 'Оплаченные',
    count: invoices.value.filter(inv => inv.status === 'paid').length,
  },
  {
    value: 'all' as const,
    label: 'Все счета',
    count: invoices.value.length,
  },
]);

const filteredInvoices = computed(() => {
  let filtered = invoices.value;

  switch (activeTab.value) {
    case 'unpaid':
      filtered = filtered.filter(inv => inv.status === 'issued' || inv.status === 'overdue');
      break;
    case 'paid':
      filtered = filtered.filter(inv => inv.status === 'paid');
      break;
  }

  return filtered;
});

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredInvoices.value.slice(start, start + perPage);
});

const emptyMessage = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return 'Нет счетов к оплате';
    case 'paid':
      return 'Нет оплаченных счетов';
    default:
      return 'Счета не найдены';
  }
});

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailAddress.value);
});

// Methods
function formatMoney(kopecks: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kopecks / 100);
}

function isOverdue(invoice: Invoice): boolean {
  if (invoice.status !== 'issued' && invoice.status !== 'overdue') return false;
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

function daysUntilDue(invoice: Invoice): number | null {
  if (!invoice.due_date) return null;
  if (invoice.status !== 'issued') return null;
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Черновик',
    issued: 'Выставлен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
    cancelled: 'Отменён',
  };
  return labels[status] || status;
}

function toggleInvoiceDetails(id: number) {
  const index = expandedInvoices.value.indexOf(id);
  if (index === -1) {
    expandedInvoices.value.push(id);
  } else {
    expandedInvoices.value.splice(index, 1);
  }
}

function payInvoice(invoice: Invoice) {
  selectedInvoice.value = invoice;
}

function processPayment(method: 'card' | 'sbp') {
  // TODO: Integrate with payment provider
  alert(`Оплата через ${method === 'card' ? 'банковскую карту' : 'СБП'} будет доступна в ближайшее время.`);
  selectedInvoice.value = null;
}

function downloadInvoice(invoice: Invoice) {
  // TODO: Generate and download PDF
  alert(`Скачивание счёта ${invoice.invoice_number} будет доступно в ближайшее время.`);
}

function emailInvoice(invoice: Invoice) {
  emailModalInvoice.value = invoice;
  emailAddress.value = authStore.user?.email || '';
}

function sendEmail() {
  // TODO: Send invoice via email
  alert(`Счёт ${emailModalInvoice.value?.invoice_number} будет отправлен на ${emailAddress.value}`);
  emailModalInvoice.value = null;
  emailAddress.value = '';
}

async function loadInvoices() {
  const accountIds = authStore.account ? [authStore.account.id] : [];
  if (accountIds.length === 0) return;

  isLoading.value = true;

  try {
    // Load invoices for all accounts
    const allInvoices: Invoice[] = [];
    for (const accountId of accountIds) {
      const { data } = await api.getInvoices(accountId, {
        year: selectedYear.value,
        limit: 100,
      });
      allInvoices.push(...data);
    }

    // Sort by date
    invoices.value = allInvoices.sort((a, b) =>
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  } catch (e) {
    console.error('Failed to load invoices:', e);
  } finally {
    isLoading.value = false;
  }
}

// Watchers
watch([currentPage, activeTab], () => {
  currentPage.value = 1;
});

watch(selectedYear, () => {
  loadInvoices();
});

// Lifecycle
onMounted(() => {
  loadInvoices();
});
</script>
