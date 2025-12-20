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

    <!-- Step 1: Enter email -->
    <form v-if="step === 'email'" @submit.prevent="handleSendCode">
      <div class="space-y-4">
        <BaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="example@mail.ru"
          :error="emailError"
          required
        />
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="w-full mt-6"
        :loading="isLoading"
      >
        Получить код
      </BaseButton>

      <p class="mt-6 text-center text-sm text-gray-500">
        На указанный email будет отправлен код подтверждения
      </p>
    </form>

    <!-- Step 2: Enter code -->
    <form v-else-if="step === 'code'" @submit.prevent="handleVerifyCode">
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600">
          Код отправлен на
          <span class="font-medium text-gray-900">{{ email }}</span>
        </p>
        <button
          type="button"
          class="text-sm text-primary-500 hover:text-primary-600 mt-1"
          @click="resetToEmail"
        >
          Изменить email
        </button>
      </div>

      <div class="space-y-4">
        <BaseInput
          v-model="code"
          label="Код подтверждения"
          placeholder="000000"
          :error="codeError"
          maxlength="6"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
        />
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="w-full mt-6"
        :loading="isLoading"
      >
        Подтвердить
      </BaseButton>

      <div class="mt-4 text-center">
        <button
          v-if="canResend"
          type="button"
          class="text-sm text-primary-500 hover:text-primary-600"
          @click="handleSendCode"
        >
          Отправить код повторно
        </button>
        <p v-else class="text-sm text-gray-500">
          Повторная отправка через {{ resendCountdown }} сек.
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BaseInput, BaseButton, BaseAlert } from '@pg19/ui';

const emit = defineEmits<{
  success: [data: unknown];
}>();

const step = ref<'email' | 'code'>('email');
const email = ref('');
const code = ref('');
const sessionId = ref('');
const error = ref('');
const emailError = ref('');
const codeError = ref('');
const isLoading = ref(false);

// Resend countdown
const resendCountdown = ref(0);
const canResend = computed(() => resendCountdown.value === 0);

let resendTimer: ReturnType<typeof setInterval> | null = null;

function startResendCountdown() {
  resendCountdown.value = 60;
  if (resendTimer) clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer!);
      resendTimer = null;
    }
  }, 1000);
}

function validateEmail(): boolean {
  emailError.value = '';

  if (!email.value.trim()) {
    emailError.value = 'Введите email';
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Неверный формат email';
    return false;
  }

  return true;
}

function validateCode(): boolean {
  codeError.value = '';

  if (!code.value.trim()) {
    codeError.value = 'Введите код';
    return false;
  }

  if (!/^\d{6}$/.test(code.value.trim())) {
    codeError.value = 'Код должен содержать 6 цифр';
    return false;
  }

  return true;
}

async function handleSendCode() {
  if (!validateEmail()) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/auth/email/send', {
      method: 'POST',
      body: { email: email.value.trim() },
    });

    sessionId.value = response.data.sessionId;
    step.value = 'code';
    code.value = '';
    startResendCountdown();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || 'Ошибка отправки кода';
  } finally {
    isLoading.value = false;
  }
}

async function handleVerifyCode() {
  if (!validateCode()) return;

  isLoading.value = true;
  error.value = '';
  codeError.value = '';

  try {
    const response = await $fetch('/api/auth/email/verify', {
      method: 'POST',
      body: {
        sessionId: sessionId.value,
        code: code.value.trim(),
      },
    });

    emit('success', response.data);
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    const message = err.data?.message || 'Ошибка проверки кода';

    // Show as field error if it's about the code
    if (message.includes('Неверный код') || message.includes('попыток')) {
      codeError.value = message;
    } else {
      error.value = message;
    }
  } finally {
    isLoading.value = false;
  }
}

function resetToEmail() {
  step.value = 'email';
  code.value = '';
  sessionId.value = '';
  error.value = '';
  codeError.value = '';
  if (resendTimer) {
    clearInterval(resendTimer);
    resendTimer = null;
  }
}

onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer);
  }
});
</script>
