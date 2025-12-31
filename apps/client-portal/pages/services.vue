<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Услуги</h1>

    <!-- Current Subscriptions -->
    <BaseCard v-if="subscriptions.length > 0" class="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
      <div class="flex items-center gap-2 mb-4">
        <span class="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded">Ваши услуги</span>
      </div>

      <div class="space-y-3">
        <div
          v-for="sub in subscriptions"
          :key="sub.id"
          class="flex items-center justify-between py-3 border-b border-primary-200/50 last:border-0"
        >
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900">{{ sub.service?.name || 'Услуга' }}</h4>
            <p v-if="sub.service?.description" class="text-sm text-gray-600 mt-0.5">
              {{ sub.service.description }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              С {{ formatDate(sub.started_at) }}
            </p>
          </div>
          <div class="ml-4 text-right">
            <p class="text-lg font-bold text-primary-600">
              {{ formatMoney(getSubscriptionPrice(sub)) }}
            </p>
            <p class="text-xs text-gray-500">в месяц</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 mt-4 border-t border-primary-200">
        <span class="font-medium text-gray-700">Итого в месяц:</span>
        <span class="text-2xl font-bold text-primary-600">{{ formatMoney(totalMonthlyPrice) }}</span>
      </div>
    </BaseCard>

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

    <!-- Tariffs Tab -->
    <div v-if="activeTab === 'tariffs'">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BaseCard v-for="i in 3" :key="i">
          <div class="animate-pulse space-y-4">
            <div class="h-6 w-32 bg-gray-200 rounded" />
            <div class="h-4 w-full bg-gray-200 rounded" />
            <div class="h-8 w-24 bg-gray-200 rounded" />
            <div class="h-10 w-full bg-gray-200 rounded" />
          </div>
        </BaseCard>
      </div>

      <div v-else-if="availableServices.length === 0" class="text-center py-12">
        <TariffIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">Нет доступных тарифов</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="service in availableServices"
          :key="service.id"
          class="relative"
        >
          <!-- Popular badge -->
          <div
            v-if="service.sort_order === 1"
            class="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
          >
            <span class="px-3 py-1 bg-accent-orange text-white text-xs font-bold rounded-full">
              Популярный
            </span>
          </div>

          <BaseCard
            class="h-full flex flex-col transition-all"
            :class="[
              isCurrentService(service.id)
                ? 'border-2 border-primary-500 shadow-lg'
                : 'hover:shadow-md hover:border-gray-300',
              service.sort_order === 1 ? 'border-2 border-accent-orange' : ''
            ]"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <h3 class="text-xl font-bold text-gray-900">{{ service.name }}</h3>
                <span
                  v-if="isCurrentService(service.id)"
                  class="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded"
                >
                  Ваш тариф
                </span>
              </div>

              <p v-if="service.description" class="text-gray-500 mb-4">
                {{ service.description }}
              </p>

              <!-- Features list (mock) -->
              <ul class="space-y-2 mb-6">
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon class="w-4 h-4 text-secondary-500 flex-shrink-0" />
                  <span>Безлимитный интернет</span>
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon class="w-4 h-4 text-secondary-500 flex-shrink-0" />
                  <span>Скорость до {{ getSpeedLabel(service) }}</span>
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-600">
                  <CheckIcon class="w-4 h-4 text-secondary-500 flex-shrink-0" />
                  <span>Техподдержка 24/7</span>
                </li>
              </ul>

              <div class="mb-6">
                <span class="text-3xl font-bold text-gray-900">
                  {{ formatMoney(service.price_monthly) }}
                </span>
                <span class="text-gray-500">/мес</span>
                <p v-if="service.price_connection" class="text-sm text-gray-400 mt-1">
                  Подключение: {{ formatMoney(service.price_connection) }}
                </p>
              </div>
            </div>

            <BaseButton
              v-if="isCurrentService(service.id)"
              variant="ghost"
              class="w-full"
              disabled
            >
              <CheckIcon class="w-5 h-5 mr-2" />
              Текущий тариф
            </BaseButton>
            <BaseButton
              v-else
              :variant="service.sort_order === 1 ? 'primary' : 'outline'"
              class="w-full"
              @click="openChangeTariffModal(service)"
            >
              Выбрать тариф
            </BaseButton>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Additional Services Tab -->
    <div v-else-if="activeTab === 'additional'">
      <div class="space-y-4">
        <BaseCard
          v-for="addon in additionalServices"
          :key="addon.id"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="addon.bgClass"
              >
                <component :is="addon.icon" class="w-6 h-6" :class="addon.iconClass" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{{ addon.name }}</h4>
                <p class="text-sm text-gray-500">{{ addon.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ addon.price }}</p>
                <p v-if="addon.isActive" class="text-xs text-secondary-600">Подключено</p>
              </div>
              <BaseButton
                :variant="addon.isActive ? 'ghost' : 'outline'"
                size="sm"
              >
                {{ addon.isActive ? 'Отключить' : 'Подключить' }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Vacation Tab -->
    <div v-else-if="activeTab === 'vacation'">
      <BaseCard>
        <div class="max-w-lg">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <VacationIcon class="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Приостановка услуг</h3>
              <p class="text-gray-500">Уезжаете в отпуск? Приостановите услуги и не платите.</p>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input
                v-model="vacation.startDate"
                type="date"
                :min="minVacationDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <input
                v-model="vacation.endDate"
                type="date"
                :min="vacation.startDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div v-if="vacationDuration" class="p-4 bg-gray-50 rounded-lg mb-6">
            <div class="flex justify-between mb-2">
              <span class="text-gray-600">Длительность</span>
              <span class="font-medium">{{ vacationDuration }} дней</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Экономия</span>
              <span class="font-medium text-secondary-600">~{{ formatMoney(vacationSavings) }}</span>
            </div>
          </div>

          <BaseAlert v-if="vacationDuration && vacationDuration < 7" variant="warning" class="mb-6">
            Минимальный срок приостановки — 7 дней
          </BaseAlert>

          <BaseAlert v-else-if="vacationDuration && vacationDuration > 90" variant="warning" class="mb-6">
            Максимальный срок приостановки — 90 дней
          </BaseAlert>

          <div class="text-sm text-gray-500 mb-6">
            <p class="font-medium mb-2">Условия:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Минимум 7 дней, максимум 90 дней</li>
              <li>Не более 2 раз в год</li>
              <li>Плата за приостановку: {{ formatMoney(5000) }}/мес</li>
              <li>Интернет будет отключён на указанный период</li>
            </ul>
          </div>

          <BaseButton
            variant="primary"
            :disabled="!canSubmitVacation"
            @click="submitVacation"
          >
            Приостановить услуги
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- Change Tariff Modal -->
    <BaseModal v-model:isOpen="showChangeTariffModal" title="Смена тарифа">
      <div v-if="selectedService" class="space-y-4">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="mb-2">
            <span class="text-gray-600">Текущие услуги:</span>
            <ul class="mt-1 text-sm">
              <li v-for="sub in subscriptions" :key="sub.id" class="font-medium">
                {{ sub.service?.name }}
              </li>
            </ul>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-200">
            <span class="text-gray-600">Новый тариф</span>
            <span class="font-semibold text-primary-600">{{ selectedService.name }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Когда применить изменения?
          </label>
          <div class="space-y-2">
            <label class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                v-model="changeOption"
                type="radio"
                value="now"
                class="mt-1"
              />
              <div>
                <p class="font-medium text-gray-900">Сейчас</p>
                <p class="text-sm text-gray-500">Будет выполнен перерасчёт за текущий период</p>
              </div>
            </label>
            <label class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                v-model="changeOption"
                type="radio"
                value="next_period"
                class="mt-1"
              />
              <div>
                <p class="font-medium text-gray-900">С начала следующего периода</p>
                <p class="text-sm text-gray-500">Текущий тариф сохранится до конца оплаченного периода</p>
              </div>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="ghost" @click="showChangeTariffModal = false">
            Отмена
          </BaseButton>
          <BaseButton variant="primary" @click="confirmTariffChange">
            Подтвердить смену
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseModal, BaseAlert, StatusBadge, formatMoney, formatDate } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Service, Subscription } from '@pg19/types';

// Icons
import CheckIcon from '~/components/icons/CheckCircleIcon.vue';
import TariffIcon from '~/components/icons/TariffIcon.vue';
import StaticIpIcon from '~/components/icons/StaticIpIcon.vue';
import ShieldIcon from '~/components/icons/ShieldIcon.vue';
import TvIcon from '~/components/icons/TvIcon.vue';
import VacationIcon from '~/components/icons/VacationIcon.vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

// State
const activeTab = ref<'tariffs' | 'additional' | 'vacation'>('tariffs');
const availableServices = ref<Service[]>([]);
const subscriptions = ref<Subscription[]>([]);
const isLoading = ref(true);
const showChangeTariffModal = ref(false);
const selectedService = ref<Service | null>(null);
const changeOption = ref('next_period');

// Helper function to get subscription price
function getSubscriptionPrice(sub: Subscription): number {
  if (sub.custom_price !== null) return sub.custom_price;
  return (sub.service?.price_monthly || 0) * 100;
}

// Total monthly price
const totalMonthlyPrice = computed(() => {
  return subscriptions.value.reduce((sum, sub) => sum + getSubscriptionPrice(sub), 0);
});

const vacation = reactive({
  startDate: '',
  endDate: '',
});

const tabs = [
  { id: 'tariffs' as const, label: 'Услуги' },
  { id: 'additional' as const, label: 'Дополнительные услуги' },
  { id: 'vacation' as const, label: 'Приостановка' },
];

const additionalServices = [
  {
    id: 'static_ip',
    name: 'Статический IP',
    description: 'Постоянный внешний IP-адрес',
    price: '100 ₽/мес',
    isActive: false,
    icon: StaticIpIcon,
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    id: 'antivirus',
    name: 'Антивирус Kaspersky',
    description: 'Защита до 3 устройств',
    price: '150 ₽/мес',
    isActive: false,
    icon: ShieldIcon,
    bgClass: 'bg-red-100',
    iconClass: 'text-red-600',
  },
  {
    id: 'iptv',
    name: 'IPTV 100+ каналов',
    description: 'HD качество, архив 7 дней',
    price: '300 ₽/мес',
    isActive: false,
    icon: TvIcon,
    bgClass: 'bg-purple-100',
    iconClass: 'text-purple-600',
  },
];

// Computed
const minVacationDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
});

const vacationDuration = computed(() => {
  if (!vacation.startDate || !vacation.endDate) return 0;
  const start = new Date(vacation.startDate);
  const end = new Date(vacation.endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const vacationSavings = computed(() => {
  if (!vacationDuration.value || !totalMonthlyPrice.value) return 0;
  const dailyRate = totalMonthlyPrice.value / 30;
  return Math.floor(dailyRate * vacationDuration.value) - 5000; // minus vacation fee
});

const canSubmitVacation = computed(() => {
  return vacationDuration.value >= 7 && vacationDuration.value <= 90;
});

// Methods
function isCurrentService(serviceId: number): boolean {
  return subscriptions.value.some(sub => {
    const subServiceId = typeof sub.service_id === 'number'
      ? sub.service_id
      : sub.service?.id;
    return subServiceId === serviceId;
  });
}

function getSpeedLabel(service: Service): string {
  // Mock speed based on price
  const price = service.price_monthly;
  if (price <= 400) return '30 Мбит/с';
  if (price <= 700) return '100 Мбит/с';
  if (price <= 1000) return '300 Мбит/с';
  if (price <= 1500) return '500 Мбит/с';
  return '1 Гбит/с';
}

function openChangeTariffModal(service: Service) {
  selectedService.value = service;
  changeOption.value = 'next_period';
  showChangeTariffModal.value = true;
}

function confirmTariffChange() {
  // TODO: Call API to change tariff
  alert(`Заявка на смену тарифа на "${selectedService.value?.name}" принята!`);
  showChangeTariffModal.value = false;
}

function submitVacation() {
  // TODO: Call API to submit vacation
  alert(`Услуги будут приостановлены с ${vacation.startDate} по ${vacation.endDate}`);
}

// Load data
onMounted(async () => {
  const accountId = authStore.account?.id;

  try {
    const [services, subs] = await Promise.all([
      api.getServices(),
      accountId ? api.getSubscriptions(accountId) : Promise.resolve([]),
    ]);

    availableServices.value = services;

    // Store all active subscriptions sorted by price (highest first)
    subscriptions.value = subs
      .filter(s => s.status === 'active')
      .sort((a, b) => {
        const priceA = a.custom_price ?? (a.service?.price_monthly || 0) * 100;
        const priceB = b.custom_price ?? (b.service?.price_monthly || 0) * 100;
        return priceB - priceA;
      });
  } catch (e) {
    console.error('Failed to load services:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
