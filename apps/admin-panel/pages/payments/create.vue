<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/payments" class="text-gray-500 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Новый платёж</h1>
    </div>

    <BaseAlert
      v-if="error"
      variant="error"
      :message="error"
      class="mb-6"
      dismissible
      @dismiss="error = ''"
    />

    <BaseAlert
      v-if="success"
      variant="success"
      message="Платёж успешно создан"
      class="mb-6"
    />

    <BaseCard class="max-w-lg">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <BaseInput
            v-model="form.account_id"
            label="ID лицевого счёта"
            placeholder="UUID лицевого счёта"
            required
          />

          <BaseInput
            v-model="form.amount"
            type="number"
            label="Сумма (рубли)"
            placeholder="500.00"
            required
          />

          <BaseSelect
            v-model="form.provider"
            :options="providerOptions"
            label="Способ оплаты"
            required
          />

          <BaseInput
            v-model="form.external_id"
            label="Внешний ID (опционально)"
            placeholder="ID в платёжной системе"
          />
        </div>

        <div class="mt-6 flex gap-3">
          <NuxtLink to="/payments">
            <BaseButton variant="ghost">Отмена</BaseButton>
          </NuxtLink>
          <BaseButton type="submit" variant="primary" :loading="isSubmitting">
            Создать платёж
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseInput, BaseSelect, BaseButton, BaseAlert } from '@pg19/ui';
import type { Payment } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const api = useApi();

const form = reactive({
  account_id: '',
  amount: '',
  provider: 'cash',
  external_id: '',
});

const providerOptions = [
  { value: 'cash', label: 'Наличные' },
  { value: 'bank_transfer', label: 'Банковский перевод' },
  { value: 'terminal', label: 'Терминал' },
  { value: 'sbp', label: 'СБП' },
];

const error = ref('');
const success = ref(false);
const isSubmitting = ref(false);

async function handleSubmit() {
  if (!form.account_id || !form.amount) {
    error.value = 'Заполните обязательные поля';
    return;
  }

  isSubmitting.value = true;
  error.value = '';
  success.value = false;

  try {
    const data: Partial<Payment> = {
      account_id: form.account_id,
      amount: Math.round(parseFloat(form.amount) * 100),
      provider: form.provider as Payment['provider'],
      status: 'succeeded',
      external_id: form.external_id || null,
      metadata: {},
    };

    await api.createPayment(data);
    success.value = true;

    // Reset form
    form.account_id = '';
    form.amount = '';
    form.external_id = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка при создании платежа';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
