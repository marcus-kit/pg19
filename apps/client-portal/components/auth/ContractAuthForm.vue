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

    <form @submit.prevent="handleSubmit" autocomplete="on">
      <div class="space-y-4">
        <BaseInput
          v-model="form.contractNumber"
          label="Номер договора"
          placeholder="100001"
          :error="errors.contractNumber"
          autocomplete="username"
          name="username"
          required
        />

        <BaseInput
          v-model="form.fullName"
          label="ФИО"
          placeholder="Иванов Иван"
          :error="errors.fullName"
          autocomplete="current-password"
          name="password"
          type="text"
          required
        />
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="w-full mt-6"
        :loading="isLoading"
      >
        Войти
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      Введите фамилию и имя как указано в договоре
    </p>
  </div>
</template>

<script setup lang="ts">
import { BaseInput, BaseButton, BaseAlert } from '@pg19/ui';

const emit = defineEmits<{
  success: [data: { person: unknown; contract: unknown; accounts: unknown[] }];
}>();

const api = useApi();

const form = reactive({
  contractNumber: '',
  fullName: '',
});

const errors = reactive({
  contractNumber: '',
  fullName: '',
});

const error = ref('');
const isLoading = ref(false);

function validate(): boolean {
  let isValid = true;
  errors.contractNumber = '';
  errors.fullName = '';

  if (!form.contractNumber.trim()) {
    errors.contractNumber = 'Введите номер договора';
    isValid = false;
  }

  if (!form.fullName.trim()) {
    errors.fullName = 'Введите ФИО';
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validate()) return;

  isLoading.value = true;
  error.value = '';

  try {
    const result = await api.auth.login(
      form.contractNumber.trim(),
      form.fullName.trim()
    );

    emit('success', {
      person: result.person,
      contract: result.contract,
      accounts: result.accounts,
    });
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка авторизации';
  } finally {
    isLoading.value = false;
  }
}
</script>
