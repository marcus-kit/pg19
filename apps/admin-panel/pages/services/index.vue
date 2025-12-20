<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Сервисы</h1>
      <BaseButton variant="primary" @click="showCreateModal = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Добавить сервис
      </BaseButton>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard v-for="i in 6" :key="i">
        <div class="animate-pulse space-y-4">
          <div class="h-6 w-32 bg-gray-200 rounded" />
          <div class="h-4 w-full bg-gray-200 rounded" />
          <div class="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </BaseCard>
    </div>

    <div v-else-if="services.length === 0" class="text-center py-12">
      <p class="text-gray-500">Сервисы не найдены</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard v-for="service in services" :key="service.id">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
            <BaseBadge v-if="!service.is_active" variant="gray">Неактивен</BaseBadge>
          </div>
          <BaseButton variant="ghost" size="sm" @click="editService(service)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </BaseButton>
        </div>

        <p v-if="service.description" class="text-sm text-gray-500 mb-4">
          {{ service.description }}
        </p>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Абонплата</span>
            <span class="font-semibold">{{ formatMoney(service.price_monthly * 100) }}/мес</span>
          </div>
          <div v-if="service.price_connection" class="flex justify-between">
            <span class="text-gray-500">Подключение</span>
            <span class="font-semibold">{{ formatMoney(service.price_connection * 100) }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal
      v-model:is-open="showCreateModal"
      :title="editingService ? 'Редактирование сервиса' : 'Новый сервис'"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="form.name"
          label="Название"
          placeholder="Базовый 100"
          required
        />
        <BaseInput
          v-model="form.description"
          label="Описание"
          placeholder="Интернет до 100 Мбит/с"
        />
        <BaseInput
          v-model="form.price_monthly"
          type="number"
          label="Абонплата (рубли)"
          placeholder="500"
          required
        />
        <BaseInput
          v-model="form.price_connection"
          type="number"
          label="Стоимость подключения (рубли)"
          placeholder="0"
        />
        <div class="flex items-center gap-2">
          <input
            id="is_active"
            v-model="form.is_active"
            type="checkbox"
            class="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <label for="is_active" class="text-sm text-gray-700">Активен</label>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="closeModal">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" :loading="isSubmitting" @click="submitForm">
          {{ editingService ? 'Сохранить' : 'Создать' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseBadge, BaseModal, BaseInput, formatMoney } from '@pg19/ui';
import type { Service } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const services = ref<Service[]>([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const isSubmitting = ref(false);
const editingService = ref<Service | null>(null);

const form = reactive({
  name: '',
  description: '',
  price_monthly: '',
  price_connection: '',
  is_active: true,
});

function editService(service: Service) {
  editingService.value = service;
  form.name = service.name;
  form.description = service.description || '';
  form.price_monthly = String(service.price_monthly);
  form.price_connection = service.price_connection ? String(service.price_connection) : '';
  form.is_active = service.is_active;
  showCreateModal.value = true;
}

function closeModal() {
  showCreateModal.value = false;
  editingService.value = null;
  form.name = '';
  form.description = '';
  form.price_monthly = '';
  form.price_connection = '';
  form.is_active = true;
}

async function submitForm() {
  if (!form.name || !form.price_monthly) return;

  isSubmitting.value = true;
  try {
    const data: Partial<Service> = {
      name: form.name,
      description: form.description || null,
      price_monthly: parseFloat(form.price_monthly),
      price_connection: form.price_connection ? parseFloat(form.price_connection) : null,
      is_active: form.is_active,
    };

    if (editingService.value) {
      await api.updateService(editingService.value.id, data);
    } else {
      await api.createService(data);
    }

    await loadServices();
    closeModal();
  } catch (e) {
    console.error('Failed to save service:', e);
  } finally {
    isSubmitting.value = false;
  }
}

async function loadServices() {
  isLoading.value = true;
  try {
    const result = await api.getServices({ filter: {} }); // Get all, including inactive
    services.value = result as unknown as Service[];
  } catch (e) {
    console.error('Failed to load services:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadServices();
});
</script>
