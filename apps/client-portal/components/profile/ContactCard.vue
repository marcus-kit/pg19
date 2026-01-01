<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Контактные данные</h3>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Phone -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <PhoneIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Телефон</p>
            <p class="font-medium text-gray-900 dark:text-white truncate">
              {{ phone ? formatPhone(phone) : 'Не указан' }}
            </p>
          </div>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Редактировать телефон"
          @click="$emit('edit', 'phone')"
        >
          <PencilIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      <!-- Email -->
      <div class="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <EmailIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p class="font-medium text-gray-900 dark:text-white truncate">
              {{ email || 'Не указан' }}
            </p>
          </div>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Редактировать email"
          @click="$emit('edit', 'email')"
        >
          <PencilIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      <!-- Telegram -->
      <div class="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <TelegramIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400">Telegram</p>
            <p class="font-medium text-gray-900 dark:text-white truncate">
              {{ telegramUsername ? '@' + telegramUsername : 'Не привязан' }}
            </p>
          </div>
        </div>
        <button
          v-if="telegramUsername"
          class="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400
                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          @click="$emit('unlink-telegram')"
        >
          Отвязать
        </button>
        <button
          v-else
          class="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400
                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          @click="$emit('link-telegram')"
        >
          Привязать
        </button>
      </div>

      <!-- Status -->
      <div class="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <UserIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Статус</p>
            <StatusBadge :status="status" type="person" />
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard, StatusBadge, formatPhone } from '@pg19/ui';
import PhoneIcon from '~/components/icons/PhoneIcon.vue';
import EmailIcon from '~/components/icons/EmailIcon.vue';
import TelegramIcon from '~/components/icons/TelegramIcon.vue';
import UserIcon from '~/components/icons/UserIcon.vue';
import PencilIcon from '~/components/icons/PencilIcon.vue';

interface Props {
  phone?: string | null;
  email?: string | null;
  telegramUsername?: string | null;
  status: string;
}

defineProps<Props>();

defineEmits<{
  edit: [field: 'phone' | 'email'];
  'link-telegram': [];
  'unlink-telegram': [];
}>();
</script>
