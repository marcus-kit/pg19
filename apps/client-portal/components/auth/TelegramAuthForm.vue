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

    <div class="text-center">
      <div class="mb-6">
        <div class="w-16 h-16 bg-[#0088cc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Войти через Telegram
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ waitingForConfirm
            ? 'Откройте Telegram и нажмите START в боте'
            : 'Нажмите кнопку для авторизации через Telegram'
          }}
        </p>
      </div>

      <!-- Waiting for confirmation state -->
      <div v-if="waitingForConfirm" class="mb-6">
        <div class="flex flex-col items-center gap-4">
          <BaseSpinner class="w-8 h-8 text-[#0088cc]" />
          <div class="text-sm text-gray-600">
            Ожидание подтверждения...
            <span class="text-gray-400">({{ remainingTime }}с)</span>
          </div>
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
            @click="cancelAuth"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Start auth button -->
      <div v-else class="mb-6">
        <BaseButton
          type="button"
          variant="primary"
          size="lg"
          :loading="isLoading"
          class="w-full !bg-[#0088cc] hover:!bg-[#0077b5]"
          @click="startAuth"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Открыть Telegram
        </BaseButton>
      </div>

      <p class="text-sm text-gray-500">
        Ваш Telegram должен быть привязан к аккаунту.
        <br />
        Для привязки обратитесь в поддержку.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseAlert, BaseButton, BaseSpinner } from '@pg19/ui';

const STORAGE_KEY = 'tg_auth_session';

const emit = defineEmits<{
  success: [data: unknown];
}>();

const error = ref('');
const isLoading = ref(false);
const waitingForConfirm = ref(false);
const sessionId = ref<string | null>(null);
const remainingTime = ref(180);
const deepLink = ref<string | null>(null);

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Check for pending session on mount (user returning from Telegram)
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
      const remaining = data.expiresIn - elapsed;

      if (remaining > 10) {
        // Resume polling
        sessionId.value = data.sessionId;
        remainingTime.value = remaining;
        waitingForConfirm.value = true;
        startPolling();
        startCountdown();
      } else {
        // Session expired, clean up
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});

async function startAuth() {
  error.value = '';
  isLoading.value = true;

  const config = useRuntimeConfig();

  try {
    // Initialize session and get deep link via Edge Function
    const response = await $fetch<{
      sessionId: string;
      deepLink: string;
      expiresIn: number;
    }>(`${config.public.supabaseUrl}/functions/v1/telegram-auth-init`, {
      method: 'POST',
    });

    sessionId.value = response.sessionId;
    remainingTime.value = response.expiresIn;
    deepLink.value = response.deepLink;

    // Save session to localStorage (for iOS - user will leave the page)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sessionId: response.sessionId,
      expiresIn: response.expiresIn,
      startedAt: Date.now(),
    }));

    // Start polling and countdown BEFORE opening link
    waitingForConfirm.value = true;
    isLoading.value = false;
    startPolling();
    startCountdown();

    // Use location.href for iOS compatibility (works better than window.open)
    window.location.href = response.deepLink;
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err.data?.message || 'Ошибка инициализации';
    isLoading.value = false;
  }
}

function startPolling() {
  const config = useRuntimeConfig();

  // Poll every 2 seconds
  pollingInterval = setInterval(async () => {
    if (!sessionId.value) {
      stopPolling();
      return;
    }

    try {
      const response = await $fetch<{
        status: 'pending' | 'verified' | 'expired';
        data?: unknown;
        message?: string;
      }>(`${config.public.supabaseUrl}/functions/v1/telegram-auth-check`, {
        method: 'POST',
        body: { sessionId: sessionId.value },
      });

      if (response.status === 'verified' && response.data) {
        stopPolling();
        localStorage.removeItem(STORAGE_KEY);
        waitingForConfirm.value = false;
        emit('success', response.data);
      } else if (response.status === 'expired') {
        stopPolling();
        localStorage.removeItem(STORAGE_KEY);
        waitingForConfirm.value = false;
        error.value = response.message || 'Сессия истекла. Попробуйте снова';
      }
      // If pending, continue polling
    } catch (e: unknown) {
      console.error('Polling error:', e);
      // Don't stop polling on network errors, keep trying
    }
  }, 2000);
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    remainingTime.value -= 1;
    if (remainingTime.value <= 0) {
      stopPolling();
      localStorage.removeItem(STORAGE_KEY);
      waitingForConfirm.value = false;
      error.value = 'Время ожидания истекло. Попробуйте снова';
    }
  }, 1000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function cancelAuth() {
  stopPolling();
  localStorage.removeItem(STORAGE_KEY);
  waitingForConfirm.value = false;
  sessionId.value = null;
}

onUnmounted(() => {
  stopPolling();
});
</script>
