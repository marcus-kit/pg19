<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Безопасность</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BaseCard title="Способы входа">
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TelegramIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">Telegram</p>
                <p class="text-sm text-gray-500">
                  {{ authStore.user?.telegram_username ? '@' + authStore.user.telegram_username : 'Не привязан' }}
                </p>
              </div>
            </div>
            <button
              v-if="authStore.user?.telegram_username"
              class="text-sm text-red-500 hover:text-red-600"
            >
              Отвязать
            </button>
            <button
              v-else
              class="text-sm text-primary-500 hover:text-primary-600"
            >
              Привязать
            </button>
          </div>

          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <DocumentIcon class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">По номеру договора</p>
                <p class="text-sm text-gray-500">Договор + ФИО</p>
              </div>
            </div>
            <span class="text-sm text-secondary-600">Активен</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="История входов">
        <div class="space-y-3">
          <div
            v-for="session in loginHistory"
            :key="session.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-3">
              <component
                :is="session.device === 'mobile' ? PhoneIcon : DesktopIcon"
                class="w-5 h-5 text-gray-400"
              />
              <div>
                <p class="text-sm text-gray-900">{{ session.method }}</p>
                <p class="text-xs text-gray-500">{{ session.browser }} · {{ session.location }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatDate(session.date) }}</p>
              <p class="text-xs text-gray-400">{{ formatTime(session.date) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100">
          <button class="text-sm text-red-500 hover:text-red-600 font-medium">
            Завершить все сессии
          </button>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, formatDate } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';

// Icons
import TelegramIcon from '~/components/icons/TelegramIcon.vue';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import PhoneIcon from '~/components/icons/PhoneIcon.vue';
import DesktopIcon from '~/components/icons/DesktopIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();

// Mock data - in production would come from API
const loginHistory = [
  { id: 1, method: 'Telegram', browser: 'Safari', location: 'Москва', device: 'mobile', date: '2025-01-15T14:32:00' },
  { id: 2, method: 'По договору', browser: 'Chrome', location: 'Москва', device: 'desktop', date: '2025-01-10T11:15:00' },
  { id: 3, method: 'Telegram', browser: 'App', location: 'Москва', device: 'mobile', date: '2025-01-05T09:00:00' },
];

function formatTime(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
</script>
