<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Сервисы</h1>

    <!-- Current Service -->
    <BaseCard v-if="currentSubscription" class="mb-6 border-2 border-primary-500">
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <BaseBadge variant="primary">Текущий сервис</BaseBadge>
            <StatusBadge :status="currentSubscription.status" type="subscription" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">
            {{ currentSubscription.service?.name || 'Сервис' }}
          </h3>
          <p v-if="currentSubscription.service?.description" class="text-gray-500 mt-1">
            {{ currentSubscription.service.description }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-gray-900">
            {{ formatMoney(currentServicePrice) }}
          </p>
          <p class="text-sm text-gray-500">в месяц</p>
        </div>
      </div>
    </BaseCard>

    <!-- Available Services -->
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Доступные сервисы</h2>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard v-for="i in 3" :key="i">
        <div class="animate-pulse space-y-4">
          <div class="h-6 w-32 bg-gray-200 rounded" />
          <div class="h-4 w-full bg-gray-200 rounded" />
          <div class="h-8 w-24 bg-gray-200 rounded" />
          <div class="h-10 w-full bg-gray-200 rounded" />
        </div>
      </BaseCard>
    </div>

    <div v-else-if="availableServices.length === 0" class="text-center py-12 text-gray-500">
      <p>Нет доступных сервисов</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard
        v-for="service in availableServices"
        :key="service.id"
        :class="{ 'border-2 border-secondary-500': isCurrentService(service.id) }"
      >
        <div class="flex flex-col h-full">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ service.name }}</h3>
              <BaseBadge v-if="isCurrentService(service.id)" variant="success" size="sm">
                Активен
              </BaseBadge>
            </div>
            <p v-if="service.description" class="text-sm text-gray-500 mb-4">
              {{ service.description }}
            </p>
            <div class="mb-4">
              <span class="text-2xl font-bold text-gray-900">
                {{ formatMoney(service.price_monthly * 100) }}
              </span>
              <span class="text-gray-500">/мес</span>
            </div>
            <div v-if="service.price_connection" class="text-sm text-gray-500 mb-4">
              Подключение: {{ formatMoney(service.price_connection * 100) }}
            </div>
          </div>
          <BaseButton
            v-if="!isCurrentService(service.id)"
            variant="outline"
            class="w-full"
            @click="requestServiceChange(service)"
          >
            Сменить сервис
          </BaseButton>
          <BaseButton
            v-else
            variant="ghost"
            class="w-full"
            disabled
          >
            Текущий сервис
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- Change Request Modal -->
    <BaseModal
      v-model:is-open="showModal"
      title="Заявка на смену сервиса"
    >
      <p class="text-gray-600 mb-4">
        Вы хотите сменить сервис на <strong>{{ selectedService?.name }}</strong>?
      </p>
      <p class="text-sm text-gray-500 mb-4">
        Смена сервиса будет произведена с начала следующего расчётного периода.
        Для подтверждения смены сервиса свяжитесь с нашей службой поддержки.
      </p>
      <BaseAlert variant="info">
        Функция автоматической смены сервиса будет доступна в ближайшее время.
      </BaseAlert>
      <template #footer>
        <BaseButton variant="ghost" @click="showModal = false">
          Закрыть
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseBadge, BaseModal, BaseAlert, StatusBadge, formatMoney } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Service, Subscription } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();

const availableServices = ref<Service[]>([]);
const currentSubscription = ref<Subscription | null>(null);
const isLoading = ref(true);
const showModal = ref(false);
const selectedService = ref<Service | null>(null);

const currentServicePrice = computed(() => {
  if (!currentSubscription.value) return 0;
  if (currentSubscription.value.custom_price !== null) {
    return currentSubscription.value.custom_price;
  }
  return (currentSubscription.value.service?.price_monthly || 0) * 100;
});

function isCurrentService(serviceId: number): boolean {
  if (!currentSubscription.value) return false;
  const subServiceId = typeof currentSubscription.value.service_id === 'number'
    ? currentSubscription.value.service_id
    : currentSubscription.value.service?.id;
  return subServiceId === serviceId;
}

function requestServiceChange(service: Service) {
  selectedService.value = service;
  showModal.value = true;
}

onMounted(async () => {
  const accountId = authStore.primaryAccount?.id;

  try {
    const [services, subscriptions] = await Promise.all([
      api.getServices(),
      accountId ? api.getSubscriptions({
        filter: { account_id: { _eq: accountId }, status: { _eq: 'active' } },
        limit: 1,
      }) : Promise.resolve([]),
    ]);

    availableServices.value = services as unknown as Service[];
    currentSubscription.value = (subscriptions as unknown as Subscription[])[0] || null;
  } catch (e) {
    console.error('Failed to load services:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
