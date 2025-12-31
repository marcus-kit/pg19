<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Профиль</h1>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
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
            <h3 class="text-lg font-semibold text-gray-900">Персональные данные</h3>
            <button
              class="text-sm text-primary-500 hover:text-primary-600 font-medium"
              @click="showEditModal = true"
            >
              Редактировать
            </button>
          </div>
        </template>

        <dl class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-2xl font-bold text-primary-600">{{ initials }}</span>
            </div>
            <div>
              <dd class="text-lg font-semibold text-gray-900">{{ fullName }}</dd>
              <dt class="text-sm text-gray-500">Договор #{{ authStore.contract?.contract_number }}</dt>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500 mb-1">Телефон</dt>
                <dd class="text-gray-900 flex items-center gap-2">
                  <PhoneIcon class="w-4 h-4 text-gray-400" />
                  {{ authStore.person?.phone ? formatPhone(authStore.person.phone) : 'Не указан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 mb-1">Email</dt>
                <dd class="text-gray-900 flex items-center gap-2">
                  <EmailIcon class="w-4 h-4 text-gray-400" />
                  {{ authStore.person?.email || 'Не указан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 mb-1">Telegram</dt>
                <dd class="text-gray-900 flex items-center gap-2">
                  <TelegramIcon class="w-4 h-4 text-gray-400" />
                  {{ authStore.person?.telegram_username ? '@' + authStore.person.telegram_username : 'Не привязан' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500 mb-1">Статус</dt>
                <dd>
                  <StatusBadge :status="authStore.person?.status || 'active'" type="person" />
                </dd>
              </div>
            </div>
          </div>
        </dl>
      </BaseCard>

      <!-- Contract Info -->
      <BaseCard title="Договор">
        <dl class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <dt class="text-sm text-gray-500">Номер договора</dt>
              <dd class="text-lg font-semibold text-gray-900">{{ authStore.contract?.contract_number }}</dd>
            </div>
            <StatusBadge :status="authStore.contract?.status || 'active'" type="contract" />
          </div>

          <div v-if="authStore.contract?.start_date">
            <dt class="text-sm text-gray-500">Дата заключения</dt>
            <dd class="text-gray-900">{{ formatDate(authStore.contract.start_date) }}</dd>
          </div>

          <div v-if="contractAddress">
            <dt class="text-sm text-gray-500">Адрес по договору</dt>
            <dd class="text-gray-900">{{ contractAddress }}</dd>
          </div>

          <div class="pt-4 border-t border-gray-100">
            <button class="text-sm text-primary-500 hover:text-primary-600 font-medium">
              <DocumentIcon class="w-4 h-4 inline mr-1" />
              Скачать договор (PDF)
            </button>
          </div>
        </dl>
      </BaseCard>

      <!-- Service Address -->
      <BaseCard title="Адрес подключения">
        <dl class="space-y-4">
          <div v-if="serviceAddress" class="flex items-start gap-3">
            <LocationIcon class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <dd class="text-gray-900">{{ serviceAddress }}</dd>
              <div class="flex gap-4 mt-2 text-sm text-gray-500">
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
          <div v-else class="text-gray-500">
            Адрес не указан
          </div>
        </dl>
      </BaseCard>

      <!-- Account Info -->
      <BaseCard title="Лицевой счёт">
        <dl class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <dt class="text-sm text-gray-500">Лицевой счёт</dt>
              <dd class="text-lg font-semibold text-gray-900">{{ authStore.account?.contract_number }}-1</dd>
            </div>
            <BalanceDisplay :amount="authStore.currentBalance" size="lg" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-gray-500">Статус</dt>
              <dd>
                <StatusBadge :status="authStore.account?.status || 'active'" type="account" />
              </dd>
            </div>
            <div v-if="authStore.account?.credit_limit">
              <dt class="text-sm text-gray-500">Кредитный лимит</dt>
              <dd class="text-gray-900">{{ formatMoney(authStore.account.credit_limit) }}</dd>
            </div>
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
            <h4 class="text-sm font-medium text-gray-700 mb-3">Способы уведомлений</h4>
            <div class="space-y-3">
              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <EmailIcon class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900">Email</p>
                    <p class="text-sm text-gray-500">{{ authStore.person?.email || 'Не указан' }}</p>
                  </div>
                </div>
                <input
                  v-model="notifications.email"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  :disabled="!authStore.person?.email"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <PhoneIcon class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900">SMS</p>
                    <p class="text-sm text-gray-500">{{ authStore.person?.phone ? formatPhone(authStore.person.phone) : 'Не указан' }}</p>
                  </div>
                </div>
                <input
                  v-model="notifications.sms"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  :disabled="!authStore.person?.phone"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <TelegramIcon class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900">Telegram</p>
                    <p class="text-sm text-gray-500">
                      {{ authStore.person?.telegram_username ? '@' + authStore.person.telegram_username : 'Не привязан' }}
                    </p>
                  </div>
                </div>
                <input
                  v-model="notifications.telegram"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  :disabled="!authStore.person?.telegram_username"
                />
              </label>

              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <BellIcon class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900">Push-уведомления</p>
                    <p class="text-sm text-gray-500">В браузере</p>
                  </div>
                </div>
                <input
                  v-model="notifications.push"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          <!-- Notification Types -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-medium text-gray-700 mb-3">О чём уведомлять</h4>
            <div class="space-y-3">
              <label
                v-for="type in notificationTypes"
                :key="type.id"
                class="flex items-center justify-between py-2"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ type.label }}</p>
                  <p class="text-sm text-gray-500">{{ type.description }}</p>
                </div>
                <input
                  v-model="notifications.types[type.id]"
                  type="checkbox"
                  class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          <div class="pt-4">
            <BaseButton variant="primary" @click="saveNotifications">
              Сохранить настройки
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>


    <!-- Edit Modal -->
    <BaseModal v-model:isOpen="showEditModal" title="Редактирование данных">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input
            v-model="editForm.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="example@mail.ru"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="ghost" @click="showEditModal = false">
            Отмена
          </BaseButton>
          <BaseButton variant="primary" @click="saveProfile">
            Сохранить
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseModal, BalanceDisplay, StatusBadge, formatDate, formatPhone, formatMoney, formatFullName, formatAddress } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';

// Icons
import PhoneIcon from '~/components/icons/PhoneIcon.vue';
import EmailIcon from '~/components/icons/EmailIcon.vue';
import TelegramIcon from '~/components/icons/TelegramIcon.vue';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import LocationIcon from '~/components/icons/LocationIcon.vue';
import BellIcon from '~/components/icons/BellIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();

// State
const activeTab = ref<'personal' | 'notifications'>('personal');
const showEditModal = ref(false);

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
  phone: authStore.person?.phone || '',
  email: authStore.person?.email || '',
});

// Computed
const fullName = computed(() => {
  if (!authStore.person) return '';
  return formatFullName(authStore.person);
});

const initials = computed(() => {
  if (!authStore.person) return '';
  const first = authStore.person.first_name?.[0] || '';
  const last = authStore.person.last_name?.[0] || '';
  return (last + first).toUpperCase();
});

const contractAddress = computed(() => {
  if (!authStore.contract) return '';
  if (authStore.contract.address_full) return authStore.contract.address_full;
  return formatAddress({
    city: authStore.contract.address_city,
    street: authStore.contract.address_street,
    building: authStore.contract.address_building,
    apartment: authStore.contract.address_apartment,
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

// Methods
function saveProfile() {
  // TODO: Save to API
  alert('Данные сохранены');
  showEditModal.value = false;
}

function saveNotifications() {
  // TODO: Save to API
  alert('Настройки уведомлений сохранены');
}
</script>
