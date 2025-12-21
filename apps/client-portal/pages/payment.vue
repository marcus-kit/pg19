<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Пополнить баланс</h1>

    <!-- Current Balance -->
    <BaseCard class="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-primary-600 font-medium">Текущий баланс</p>
          <BalanceDisplay :amount="authStore.currentBalance" size="xl" />
        </div>
        <div v-if="recommendedAmount" class="text-right">
          <p class="text-sm text-gray-500">Рекомендуем</p>
          <p class="text-lg font-semibold text-gray-900">{{ formatMoney(recommendedAmount) }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Selected Invoice (if any) -->
    <BaseCard v-if="selectedInvoice" class="mb-6 border-l-4 border-accent-orange">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Оплата счёта</p>
          <p class="font-semibold text-gray-900">{{ selectedInvoice.invoice_number }}</p>
          <p v-if="selectedInvoice.period_start && selectedInvoice.period_end" class="text-sm text-gray-500">
            {{ formatDate(selectedInvoice.period_start) }} — {{ formatDate(selectedInvoice.period_end) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-gray-900">{{ formatMoney(selectedInvoice.amount) }}</p>
          <button
            class="text-sm text-primary-500 hover:text-primary-600"
            @click="clearInvoice"
          >
            Изменить сумму
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Amount Selection -->
    <BaseCard class="mb-6" title="Сумма пополнения">
      <div class="space-y-4">
        <!-- Amount Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Введите сумму</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₽</span>
            <input
              v-model="amountInput"
              type="number"
              min="100"
              step="100"
              class="w-full pl-10 pr-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
              @input="onAmountInput"
            />
          </div>
        </div>

        <!-- Quick Amount Buttons -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in amountPresets"
            :key="preset"
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            :class="amount === preset * 100
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            @click="setAmount(preset)"
          >
            {{ preset }} ₽
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            :class="isCustomAmount
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            @click="focusInput"
          >
            Другая
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Payment Methods -->
    <BaseCard class="mb-6" title="Способ оплаты">
      <div class="space-y-3">
        <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
          :class="selectedMethod === method.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <input
            v-model="selectedMethod"
            type="radio"
            :value="method.id"
            class="sr-only"
          />
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
            :class="method.bgClass"
          >
            <component :is="method.icon" class="w-6 h-6" :class="method.iconClass" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ method.name }}</p>
            <p class="text-sm text-gray-500">{{ method.description }}</p>
          </div>
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="selectedMethod === method.id
              ? 'border-primary-500'
              : 'border-gray-300'"
          >
            <div
              v-if="selectedMethod === method.id"
              class="w-2.5 h-2.5 rounded-full bg-primary-500"
            />
          </div>
        </label>
      </div>
    </BaseCard>

    <!-- Autopay Option -->
    <BaseCard class="mb-6">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="enableAutopay"
          type="checkbox"
          class="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
        />
        <div>
          <p class="font-medium text-gray-900">Подключить автоплатёж</p>
          <p class="text-sm text-gray-500">
            Автоматическое пополнение при балансе ниже {{ formatMoney(10000) }}
          </p>
        </div>
      </label>
    </BaseCard>

    <!-- Submit Button -->
    <BaseButton
      variant="primary"
      size="lg"
      class="w-full"
      :disabled="!canPay"
      :loading="isProcessing"
      @click="processPayment"
    >
      <WalletIcon class="w-5 h-5 mr-2" />
      Оплатить {{ formatMoney(amount) }}
    </BaseButton>

    <!-- Security Note -->
    <p class="mt-4 text-center text-sm text-gray-500">
      <LockIcon class="w-4 h-4 inline mr-1" />
      Безопасная оплата через защищённое соединение
    </p>

    <!-- Payment Modal (for SBP QR) -->
    <BaseModal v-model:isOpen="showQrModal" title="Оплата через СБП">
      <div class="text-center py-6">
        <div class="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <QrCodeIcon class="w-24 h-24 text-gray-400" />
        </div>
        <p class="text-gray-600 mb-2">Отсканируйте QR-код в приложении банка</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatMoney(amount) }}</p>
        <div class="mt-6">
          <BaseButton variant="outline" @click="showQrModal = false">
            Отмена
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseModal, BalanceDisplay, formatMoney, formatDate } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Invoice } from '@pg19/types';

// Icons
import WalletIcon from '~/components/icons/WalletIcon.vue';
import LockIcon from '~/components/icons/LockIcon.vue';
import QrCodeIcon from '~/components/icons/QrCodeIcon.vue';
import CardIcon from '~/components/icons/CardIcon.vue';
import SbpIcon from '~/components/icons/SbpIcon.vue';
import BankIcon from '~/components/icons/BankIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const authStore = useAuthStore();
const api = useApi();

// State
const amount = ref(0);
const amountInput = ref('');
const selectedMethod = ref('card');
const enableAutopay = ref(false);
const isProcessing = ref(false);
const showQrModal = ref(false);
const selectedInvoice = ref<Invoice | null>(null);

// Constants
const amountPresets = [500, 700, 1000, 2000];

const paymentMethods = [
  {
    id: 'card',
    name: 'Банковская карта',
    description: 'Visa, MasterCard, МИР',
    icon: CardIcon,
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    id: 'sbp',
    name: 'СБП',
    description: 'Система быстрых платежей',
    icon: SbpIcon,
    bgClass: 'bg-green-100',
    iconClass: 'text-green-600',
  },
  {
    id: 'yookassa',
    name: 'ЮKassa',
    description: 'Электронный кошелёк',
    icon: BankIcon,
    bgClass: 'bg-purple-100',
    iconClass: 'text-purple-600',
  },
];

// Computed
const recommendedAmount = computed(() => {
  // Recommend monthly tariff price or enough to cover negative balance
  const balance = authStore.currentBalance;
  if (balance < 0) {
    return Math.abs(balance) + 70000; // Cover debt + one month
  }
  return 70000; // Default: one month (700 rubles in kopecks)
});

const isCustomAmount = computed(() => {
  return amount.value > 0 && !amountPresets.includes(amount.value / 100);
});

const canPay = computed(() => {
  return amount.value >= 10000 && selectedMethod.value;
});

// Methods
function setAmount(rubles: number) {
  amount.value = rubles * 100;
  amountInput.value = rubles.toString();
}

function onAmountInput() {
  const value = parseInt(amountInput.value) || 0;
  amount.value = value * 100;
}

function focusInput() {
  // Focus the amount input
  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
  input?.focus();
  input?.select();
}

function clearInvoice() {
  selectedInvoice.value = null;
  amount.value = 0;
  amountInput.value = '';
}

async function processPayment() {
  if (!canPay.value) return;

  isProcessing.value = true;

  try {
    if (selectedMethod.value === 'sbp') {
      // Show QR code for SBP
      showQrModal.value = true;
      isProcessing.value = false;
      return;
    }

    // For card payments, redirect to payment gateway
    // This is a placeholder - actual implementation would integrate with payment provider
    alert(`Перенаправление на страницу оплаты...\n\nСумма: ${formatMoney(amount.value)}\nСпособ: ${selectedMethod.value}`);

  } catch (error) {
    console.error('Payment error:', error);
    alert('Ошибка при обработке платежа. Попробуйте ещё раз.');
  } finally {
    isProcessing.value = false;
  }
}

// Load invoice if specified in URL
onMounted(async () => {
  const invoiceId = route.query.invoice as string;
  if (invoiceId) {
    try {
      const invoice = await api.getInvoice(invoiceId);
      selectedInvoice.value = invoice;
      amount.value = invoice.amount;
      amountInput.value = (invoice.amount / 100).toString();
    } catch (e) {
      console.error('Failed to load invoice:', e);
    }
  }
});
</script>
