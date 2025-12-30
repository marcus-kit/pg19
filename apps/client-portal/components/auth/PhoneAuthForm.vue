<template>
  <div>
    <BaseAlert
      v-if="error"
      variant="error"
      :message="error"
      class="mb-6"
      dismissible
      @dismiss="error = ''"
    />

    <!-- Step 1: Enter phone -->
    <form v-if="step === 'phone'" @submit.prevent="handleInitAuth">
      <div class="space-y-4">
        <BaseInput
          v-model="phone"
          type="tel"
          label="Номер телефона"
          placeholder="+7 (XXX) XXX-XX-XX"
          :error="phoneError"
          required
        />
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="w-full mt-6"
        :loading="isLoading"
      >
        Продолжить
      </BaseButton>

      <p class="mt-6 text-center text-sm text-gray-500">
        Укажите номер телефона, привязанный к вашему аккаунту
      </p>
    </form>

    <!-- Step 2: Call verification -->
    <div v-else-if="step === 'call'" class="text-center">
      <div class="mb-6">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Позвоните на номер
        </h3>
        <a
          :href="`tel:${verifyNumber}`"
          class="text-2xl font-bold text-primary-500 hover:text-primary-600"
        >
          {{ formatPhoneDisplay(verifyNumber) }}
        </a>
      </div>

      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600 mb-2">
          Звоните с номера
          <span class="font-medium text-gray-900">{{ formatPhoneDisplay(phone) }}</span>
        </p>
        <p class="text-sm text-gray-500">
          После соединения сбросьте вызов
        </p>
      </div>

      <!-- Timer and status -->
      <div class="mb-6">
        <div v-if="isPolling" class="flex items-center justify-center gap-2 text-primary-500">
          <BaseSpinner class="w-5 h-5" />
          <span>Ожидание звонка... {{ timeRemaining }} сек.</span>
        </div>
        <div v-else-if="pollError" class="text-accent-pink">
          {{ pollError }}
        </div>
      </div>

      <BaseButton
        variant="ghost"
        class="w-full"
        @click="resetToPhone"
      >
        Изменить номер телефона
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseInput, BaseButton, BaseAlert, BaseSpinner } from '@pg19/ui';
import type { AuthData, PhoneAuthCheckResponse } from '@pg19/types';

const emit = defineEmits<{
  success: [data: AuthData];
}>();

const config = useRuntimeConfig();
const api = useApi();

const step = ref<'phone' | 'call'>('phone');
const phone = ref('');
const sessionId = ref('');
const verifyNumber = ref('');
const error = ref('');
const phoneError = ref('');
const pollError = ref('');
const isLoading = ref(false);
const isPolling = ref(false);

// Timer
const timeRemaining = ref(180); // 3 minutes
let pollTimer: ReturnType<typeof setInterval> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function formatPhoneDisplay(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  return phoneNumber;
}

function validatePhone(): boolean {
  phoneError.value = '';

  const digits = phone.value.replace(/\D/g, '');

  if (!digits) {
    phoneError.value = 'Введите номер телефона';
    return false;
  }

  // Normalize and validate
  let normalized = digits;
  if (normalized.startsWith('8') && normalized.length === 11) {
    normalized = '7' + normalized.slice(1);
  }
  if (normalized.startsWith('9') && normalized.length === 10) {
    normalized = '7' + normalized;
  }

  if (!/^7\d{10}$/.test(normalized)) {
    phoneError.value = 'Неверный формат номера телефона';
    return false;
  }

  return true;
}

async function handleInitAuth() {
  if (!validatePhone()) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await api.auth.phoneInit(phone.value);
    sessionId.value = response.sessionId;
    verifyNumber.value = response.verifyNumber;
    timeRemaining.value = response.expiresIn;
    step.value = 'call';

    startPolling();
    startCountdown();
  } catch (e: unknown) {
    const err = e as Error;
    error.value = err.message || 'Ошибка инициализации авторизации';
  } finally {
    isLoading.value = false;
  }
}

async function checkCallStatus() {
  if (!sessionId.value) return;

  try {
    const response = await api.auth.phoneCheck(sessionId.value);

    if (response.verified && response.auth) {
      stopPolling();
      emit('success', response.auth);
    } else if (response.message) {
      // Asterisk not available message
      pollError.value = response.message;
      stopPolling();
    }
  } catch (e: unknown) {
    const err = e as Error;
    // Session expired
    if (err.message?.includes('истекла')) {
      pollError.value = err.message;
      stopPolling();
    }
  }
}

function startPolling() {
  isPolling.value = true;
  pollError.value = '';

  // Poll every 2 seconds
  pollTimer = setInterval(checkCallStatus, 2000);

  // Initial check
  checkCallStatus();
}

function startCountdown() {
  countdownTimer = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      stopPolling();
      pollError.value = 'Время ожидания истекло. Попробуйте снова';
    }
  }, 1000);
}

function stopPolling() {
  isPolling.value = false;
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function resetToPhone() {
  stopPolling();
  step.value = 'phone';
  sessionId.value = '';
  verifyNumber.value = '';
  error.value = '';
  pollError.value = '';
  timeRemaining.value = 180;
}

onUnmounted(() => {
  stopPolling();
});
</script>
