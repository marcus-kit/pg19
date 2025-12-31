<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/users" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Новый клиент</h1>
    </div>

    <BaseAlert
      v-if="error"
      variant="error"
      :message="error"
      class="mb-6"
      dismissible
      @dismiss="error = ''"
    />

    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Data -->
        <BaseCard title="Персональные данные">
          <div class="space-y-4">
            <BaseInput
              v-model="form.last_name"
              label="Фамилия"
              placeholder="Иванов"
              required
            />
            <BaseInput
              v-model="form.first_name"
              label="Имя"
              placeholder="Иван"
              required
            />
            <BaseInput
              v-model="form.phone"
              type="tel"
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
            />
            <BaseInput
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="ivan@example.com"
            />
            <BaseSelect
              v-model="form.status"
              :options="statusOptions"
              label="Статус"
            />
          </div>
        </BaseCard>

        <!-- Passport Data -->
        <BaseCard title="Паспортные данные">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="form.passport_series"
                label="Серия"
                placeholder="1234"
              />
              <BaseInput
                v-model="form.passport_number"
                label="Номер"
                placeholder="567890"
              />
            </div>
          </div>
        </BaseCard>

        <!-- Registration Address -->
        <BaseCard title="Адрес регистрации" class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BaseInput
              v-model="form.reg_city"
              label="Город"
              placeholder="Москва"
            />
            <BaseInput
              v-model="form.reg_street"
              label="Улица"
              placeholder="ул. Ленина"
            />
            <BaseInput
              v-model="form.reg_building"
              label="Дом"
              placeholder="1"
            />
            <BaseInput
              v-model="form.reg_apartment"
              label="Квартира"
              placeholder="1"
            />
          </div>
        </BaseCard>

        <!-- Telegram -->
        <BaseCard title="Telegram" class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="form.telegram_username"
              label="Username"
              placeholder="username"
            />
            <BaseInput
              v-model="form.telegram_id"
              label="ID"
              placeholder="123456789"
            />
          </div>
        </BaseCard>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <NuxtLink to="/users">
          <BaseButton variant="ghost">Отмена</BaseButton>
        </NuxtLink>
        <BaseButton type="submit" variant="primary" :loading="isSubmitting">
          Создать клиента
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseInput, BaseSelect, BaseButton, BaseAlert } from '@pg19/ui';
import type { User } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const api = useApi();

const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  status: 'active',
  passport_series: '',
  passport_number: '',
  reg_city: '',
  reg_street: '',
  reg_building: '',
  reg_apartment: '',
  telegram_username: '',
  telegram_id: '',
});

const statusOptions = [
  { value: 'active', label: 'Активен' },
  { value: 'suspended', label: 'Приостановлен' },
  { value: 'terminated', label: 'Расторгнут' },
];

const error = ref('');
const isSubmitting = ref(false);

async function handleSubmit() {
  if (!form.first_name || !form.last_name) {
    error.value = 'Заполните обязательные поля';
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    const data: Partial<User> = {
      first_name: form.first_name,
      last_name: form.last_name,
      status: form.status as User['status'],
    };

    if (form.phone) data.phone = form.phone;
    if (form.email) data.email = form.email;
    if (form.passport_series) data.passport_series = form.passport_series;
    if (form.passport_number) data.passport_number = form.passport_number;
    if (form.reg_city) data.reg_city = form.reg_city;
    if (form.reg_street) data.reg_street = form.reg_street;
    if (form.reg_building) data.reg_building = form.reg_building;
    if (form.reg_apartment) data.reg_apartment = form.reg_apartment;
    if (form.telegram_username) data.telegram_username = form.telegram_username;
    if (form.telegram_id) data.telegram_id = form.telegram_id;

    const result = await api.createUser(data);
    router.push(`/users/${(result as User).id}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка при создании клиента';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
