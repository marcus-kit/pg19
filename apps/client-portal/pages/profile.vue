<template>
  <div class="space-y-6">
    <!-- Feedback Alert -->
    <BaseAlert
      v-if="feedbackMessage"
      :variant="feedbackType"
      dismissible
      @dismiss="feedbackMessage = ''"
    >
      {{ feedbackMessage }}
    </BaseAlert>

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Профиль</h1>

    <!-- Tabs -->
    <div>
      <div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Personal Data Tab -->
    <div v-if="activeTab === 'personal'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Data -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Персональные данные</h3>
            <button
              class="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              @click="showEditModal = true"
            >
              Редактировать
            </button>
          </div>
        </template>

        <dl class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ initials }}</span>
            </div>
            <div>
              <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ fullName }}</dd>
              <dt class="text-sm text-gray-500 dark:text-gray-400">Договор #{{ authStore.account?.contract_number }}</dt>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Телефон</dt>
                <dd class="text-gray-900 dark:text-white flex items-center gap-2">
                  <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {{ authStore.user?.phone ? formatPhone(authStore.user.phone) : 'Не указан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                <dd class="text-gray-900 dark:text-white flex items-center gap-2">
                  <EmailIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {{ authStore.user?.email || 'Не указан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Telegram</dt>
                <dd class="text-gray-900 dark:text-white flex items-center gap-2">
                  <TelegramIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {{ authStore.user?.telegram_username ? '@' + authStore.user.telegram_username : 'Не привязан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Статус</dt>
                <dd>
                  <StatusBadge :status="authStore.user?.status || 'active'" type="person" />
                </dd>
              </div>
            </div>
          </div>
        </dl>
      </BaseCard>

      <!-- Contract Info -->
      <BaseCard title="Договор">
        <dl class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div>
              <dt class="text-sm text-gray-500 dark:text-gray-400">Номер договора</dt>
              <dd class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ authStore.account?.contract_number }}
                </span>
                <button
                  class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  title="Скопировать номер договора"
                  @click="copyContractNumber"
                >
                  <ClipboardIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              </dd>
            </div>
            <StatusBadge :status="authStore.account?.contract_status || 'active'" type="contract" />
          </div>

          <div v-if="authStore.account?.start_date">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Дата заключения</dt>
            <dd class="text-gray-900 dark:text-white">{{ formatDate(authStore.account.start_date) }}</dd>
          </div>

          <div v-if="contractAddress">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Адрес по договору</dt>
            <dd class="text-gray-900 dark:text-white">{{ contractAddress }}</dd>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              class="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              :disabled="isDownloadingPdf"
              @click="downloadContractPdf"
            >
              <template v-if="isDownloadingPdf">
                <LoadingSpinner class="w-4 h-4 inline mr-1" />
                Загрузка...
              </template>
              <template v-else>
                <DocumentIcon class="w-4 h-4 inline mr-1" />
                Скачать договор (PDF)
              </template>
            </button>
          </div>
        </dl>
      </BaseCard>

      <!-- Service Address -->
      <BaseCard title="Адрес подключения">
        <dl class="space-y-4">
          <div v-if="serviceAddress" class="flex items-start gap-3">
            <LocationIcon class="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <dd class="text-gray-900 dark:text-white">{{ serviceAddress }}</dd>
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span v-if="authStore.account?.address_entrance">
                  Подъезд: {{ authStore.account.address_entrance }}
                </span>
                <span v-if="authStore.account?.address_floor">
                  Этаж: {{ authStore.account.address_floor }}
                </span>
                <span v-if="authStore.account?.address_intercom">
                  Домофон: {{ authStore.account.address_intercom }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400">
            Адрес не указан
          </div>
        </dl>
      </BaseCard>

    </div>

    <!-- Notifications Tab -->
    <div v-else-if="activeTab === 'notifications'">
      <BaseCard title="Настройки уведомлений">
        <div class="space-y-6">
          <!-- Notification Channels -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Способы уведомлений</h4>
            <div class="space-y-3">
              <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                <div class="flex items-center gap-3">
                  <EmailIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Email</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.email || 'Не указан' }}</p>
                  </div>
                </div>
                <input
                  v-model="notifications.email"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 dark:bg-slate-600 dark:border-slate-500"
                  :disabled="!authStore.user?.email"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                <div class="flex items-center gap-3">
                  <PhoneIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">SMS</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ authStore.user?.phone ? formatPhone(authStore.user.phone) : 'Не указан' }}</p>
                  </div>
                </div>
                <input
                  v-model="notifications.sms"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 dark:bg-slate-600 dark:border-slate-500"
                  :disabled="!authStore.user?.phone"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                <div class="flex items-center gap-3">
                  <TelegramIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Telegram</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ authStore.user?.telegram_username ? '@' + authStore.user.telegram_username : 'Не привязан' }}
                    </p>
                  </div>
                </div>
                <input
                  v-model="notifications.telegram"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 dark:bg-slate-600 dark:border-slate-500"
                  :disabled="!authStore.user?.telegram_username"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                <div class="flex items-center gap-3">
                  <BellIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Push-уведомления</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">В браузере</p>
                  </div>
                </div>
                <input
                  v-model="notifications.push"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 dark:bg-slate-600 dark:border-slate-500"
                />
              </label>
            </div>
          </div>

          <!-- Notification Types -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">О чём уведомлять</h4>
            <div class="space-y-3">
              <label
                v-for="type in notificationTypes"
                :key="type.id"
                class="flex items-center justify-between py-2 cursor-pointer"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ type.label }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ type.description }}</p>
                </div>
                <input
                  v-model="notifications.types[type.id]"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 dark:bg-slate-600 dark:border-slate-500"
                />
              </label>
            </div>
          </div>

          <div class="pt-4">
            <BaseButton
              variant="primary"
              :loading="isSavingNotifications"
              :disabled="isSavingNotifications"
              @click="saveNotifications"
            >
              {{ isSavingNotifications ? 'Сохранение...' : 'Сохранить настройки' }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>


    <!-- Edit Modal -->
    <BaseModal v-model:isOpen="showEditModal" title="Редактирование данных">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
          <input
            v-model="editForm.phone"
            type="tel"
            class="w-full px-3 py-2 border rounded-lg
                   bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
            :class="validationErrors.phone
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'"
            placeholder="+7 999 123 45 67"
            @input="validateField('phone')"
          />
          <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-500 dark:text-red-400">
            {{ validationErrors.phone }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg
                   bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
            :class="validationErrors.email
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'"
            placeholder="example@mail.ru"
            @input="validateField('email')"
          />
          <p v-if="validationErrors.email" class="mt-1 text-sm text-red-500 dark:text-red-400">
            {{ validationErrors.email }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">@</span>
            <input
              v-model="editForm.telegram_username"
              type="text"
              class="w-full pl-8 pr-3 py-2 border rounded-lg
                     bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
              :class="validationErrors.telegram_username
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'"
              placeholder="username"
              @input="validateField('telegram_username')"
            />
          </div>
          <p v-if="validationErrors.telegram_username" class="mt-1 text-sm text-red-500 dark:text-red-400">
            {{ validationErrors.telegram_username }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ваш username в Telegram (без @)
          </p>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="ghost" :disabled="isSavingProfile" @click="closeEditModal">
            Отмена
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="isSavingProfile"
            :disabled="isSavingProfile || !isFormValid"
            @click="saveProfile"
          >
            {{ isSavingProfile ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import {
  BaseCard,
  BaseButton,
  BaseModal,
  BaseAlert,
  StatusBadge,
  formatDate,
  formatPhone,
  formatFullName,
  formatAddress
} from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';

// Icons
import PhoneIcon from '~/components/icons/PhoneIcon.vue';
import EmailIcon from '~/components/icons/EmailIcon.vue';
import TelegramIcon from '~/components/icons/TelegramIcon.vue';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import LocationIcon from '~/components/icons/LocationIcon.vue';
import BellIcon from '~/components/icons/BellIcon.vue';
import ClipboardIcon from '~/components/icons/ClipboardIcon.vue';
import LoadingSpinner from '~/components/icons/LoadingSpinner.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// Validation schemas
const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, '')) // Remove non-digits
  .refine(val => val === '' || /^7\d{10}$/.test(val), {
    message: 'Формат: +7 XXX XXX XX XX',
  });

const emailSchema = z.string()
  .refine(val => val === '' || z.string().email().safeParse(val).success, {
    message: 'Некорректный email',
  });

const telegramUsernameSchema = z.string()
  .transform(val => val.replace(/^@/, '')) // Remove @ if present
  .refine(val => val === '' || /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(val), {
    message: 'Формат: 5-32 символа, буквы, цифры и _',
  });

// State
const activeTab = ref<'personal' | 'notifications'>('personal');
const showEditModal = ref(false);

// Loading & feedback states
const isSavingProfile = ref(false);
const isSavingNotifications = ref(false);
const isDownloadingPdf = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref<'success' | 'error' | 'warning' | 'info'>('success');

// Validation errors
const validationErrors = reactive({
  phone: '',
  email: '',
  telegram_username: '',
});

const tabs = [
  { id: 'personal' as const, label: 'Личные данные' },
  { id: 'notifications' as const, label: 'Уведомления' },
];

const notifications = reactive({
  email: true,
  sms: false,
  telegram: true,
  push: true,
  types: {
    balance_low: true,
    payment_success: true,
    charge: true,
    invoice: false,
    ticket_status: true,
    maintenance: true,
    promo: false,
  },
});

type NotificationTypeId = 'balance_low' | 'payment_success' | 'charge' | 'invoice' | 'ticket_status' | 'maintenance' | 'promo';

const notificationTypes: { id: NotificationTypeId; label: string; description: string }[] = [
  { id: 'balance_low', label: 'Низкий баланс', description: 'Когда баланс ниже порога' },
  { id: 'payment_success', label: 'Успешная оплата', description: 'После пополнения счёта' },
  { id: 'charge', label: 'Списание абонплаты', description: 'Ежемесячное списание' },
  { id: 'invoice', label: 'Новый счёт', description: 'Выставление нового счёта' },
  { id: 'ticket_status', label: 'Статус заявки', description: 'Изменение статуса обращения' },
  { id: 'maintenance', label: 'Плановые работы', description: 'Уведомления о технических работах' },
  { id: 'promo', label: 'Акции и предложения', description: 'Специальные предложения' },
];

const editForm = reactive({
  phone: authStore.user?.phone || '',
  email: authStore.user?.email || '',
  telegram_username: authStore.user?.telegram_username || '',
});

// Computed
const fullName = computed(() => {
  if (!authStore.user) return '';
  return formatFullName(authStore.user);
});

const initials = computed(() => {
  if (!authStore.user) return '';
  const first = authStore.user.first_name?.[0] || '';
  const last = authStore.user.last_name?.[0] || '';
  return (last + first).toUpperCase();
});

const contractAddress = computed(() => {
  if (!authStore.account) return '';
  if (authStore.account.address_full) return authStore.account.address_full;
  return formatAddress({
    city: authStore.account.address_city,
    street: authStore.account.address_street,
    building: authStore.account.address_building,
    apartment: authStore.account.address_apartment,
  });
});

const serviceAddress = computed(() => {
  const account = authStore.account;
  if (!account) return '';
  if (account.address_full) return account.address_full;
  return formatAddress({
    city: account.address_city,
    street: account.address_street,
    building: account.address_building,
    apartment: account.address_apartment,
  });
});

// Form validation
const isFormValid = computed(() => {
  return !validationErrors.phone && !validationErrors.email && !validationErrors.telegram_username;
});

function validateField(field: 'phone' | 'email' | 'telegram_username') {
  if (field === 'phone') {
    const result = phoneSchema.safeParse(editForm.phone);
    validationErrors.phone = result.success ? '' : result.error.errors[0]?.message || '';
  } else if (field === 'email') {
    const result = emailSchema.safeParse(editForm.email);
    validationErrors.email = result.success ? '' : result.error.errors[0]?.message || '';
  } else if (field === 'telegram_username') {
    const result = telegramUsernameSchema.safeParse(editForm.telegram_username);
    validationErrors.telegram_username = result.success ? '' : result.error.errors[0]?.message || '';
  }
}

function validateForm(): boolean {
  validateField('phone');
  validateField('email');
  validateField('telegram_username');
  return isFormValid.value;
}

function closeEditModal() {
  showEditModal.value = false;
  // Reset form to original values
  editForm.phone = authStore.user?.phone || '';
  editForm.email = authStore.user?.email || '';
  editForm.telegram_username = authStore.user?.telegram_username || '';
  // Clear validation errors
  validationErrors.phone = '';
  validationErrors.email = '';
  validationErrors.telegram_username = '';
}

// Helper function to show feedback
function showFeedback(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
  feedbackMessage.value = message;
  feedbackType.value = type;
  // Auto-dismiss after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 5000);
  }
}

// Copy contract number to clipboard
async function copyContractNumber() {
  const contractNumber = authStore.account?.contract_number;
  if (!contractNumber) return;

  try {
    await navigator.clipboard.writeText(String(contractNumber));
    showFeedback('Номер договора скопирован в буфер обмена', 'success');
  } catch {
    showFeedback('Не удалось скопировать номер договора', 'error');
  }
}

// Download contract PDF
async function downloadContractPdf() {
  if (!authStore.account?.id) return;

  isDownloadingPdf.value = true;
  try {
    // TODO: Implement when Edge Function is ready
    // const blob = await api.getContractPdf(authStore.account.id);
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `contract-${authStore.account.contract_number}.pdf`;
    // a.click();
    // URL.revokeObjectURL(url);
    showFeedback('Функция скачивания договора будет доступна в ближайшее время', 'info');
  } catch {
    showFeedback('Не удалось скачать договор', 'error');
  } finally {
    isDownloadingPdf.value = false;
  }
}

// Save profile changes
async function saveProfile() {
  // Validate before saving
  if (!validateForm()) {
    return;
  }

  const userId = authStore.user?.id;
  if (!userId) {
    showFeedback('Ошибка: пользователь не найден', 'error');
    return;
  }

  isSavingProfile.value = true;
  try {
    await api.updateProfile({
      userId,
      phone: editForm.phone,
      email: editForm.email,
      telegram_username: editForm.telegram_username,
    });
    closeEditModal();
    showFeedback('Данные профиля сохранены', 'success');
  } catch {
    showFeedback('Не удалось сохранить данные профиля', 'error');
  } finally {
    isSavingProfile.value = false;
  }
}

// Save notification settings
async function saveNotifications() {
  const userId = authStore.user?.id;
  if (!userId) {
    showFeedback('Ошибка: пользователь не найден', 'error');
    return;
  }

  isSavingNotifications.value = true;
  try {
    await api.updateNotificationSettings({
      userId,
      channels: {
        email: notifications.email,
        sms: notifications.sms,
        telegram: notifications.telegram,
        push: notifications.push,
      },
      types: {
        balance_low: notifications.types.balance_low,
        payment_received: notifications.types.payment_success,
        charges: notifications.types.charge,
        invoices: notifications.types.invoice,
        tickets: notifications.types.ticket_status,
        maintenance: notifications.types.maintenance,
        promos: notifications.types.promo,
      },
    });
    showFeedback('Настройки уведомлений сохранены', 'success');
  } catch {
    showFeedback('Не удалось сохранить настройки уведомлений', 'error');
  } finally {
    isSavingNotifications.value = false;
  }
}
</script>
