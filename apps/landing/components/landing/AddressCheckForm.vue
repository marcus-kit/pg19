<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- City -->
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
        Город
      </label>
      <select
        id="city"
        v-model="form.city"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        :class="{ 'border-red-500': errors.city }"
      >
        <option value="">Выберите город</option>
        <option value="Таганрог">Таганрог</option>
      </select>
      <p v-if="errors.city" class="mt-1 text-sm text-red-500">
        {{ errors.city }}
      </p>
    </div>

    <!-- Street -->
    <div>
      <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
        Улица
      </label>
      <input
        id="street"
        v-model="form.street"
        type="text"
        placeholder="Например: Петровская"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        :class="{ 'border-red-500': errors.street }"
      />
      <p v-if="errors.street" class="mt-1 text-sm text-red-500">
        {{ errors.street }}
      </p>
    </div>

    <!-- Building -->
    <div>
      <label for="building" class="block text-sm font-medium text-gray-700 mb-1">
        Дом
      </label>
      <input
        id="building"
        v-model="form.building"
        type="text"
        placeholder="Например: 19"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        :class="{ 'border-red-500': errors.building }"
      />
      <p v-if="errors.building" class="mt-1 text-sm text-red-500">
        {{ errors.building }}
      </p>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <svg
        v-if="isLoading"
        class="animate-spin h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ isLoading ? 'Проверяем...' : '⚓ Отдать швартовы!' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import type { AddressData } from '~/composables/useAddressCheck';

const emit = defineEmits<{
  submit: [address: AddressData];
}>();

const { isLoading } = useAddressCheck();

const form = reactive({
  city: '',
  street: '',
  building: '',
});

const errors = reactive({
  city: '',
  street: '',
  building: '',
});

function validate(): boolean {
  let isValid = true;

  errors.city = '';
  errors.street = '';
  errors.building = '';

  if (!form.city) {
    errors.city = 'Выберите город';
    isValid = false;
  }

  if (!form.street || form.street.length < 2) {
    errors.street = 'Введите название улицы';
    isValid = false;
  }

  if (!form.building) {
    errors.building = 'Введите номер дома';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validate()) return;

  emit('submit', {
    city: form.city,
    street: form.street,
    building: form.building,
  });
}
</script>
