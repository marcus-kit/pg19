<template>
  <NuxtLayout name="guest">
    <div class="w-full max-w-md">
      <BaseCard>
        <div class="text-center mb-8">
          <img src="/images/logo.png" alt="PG19" class="h-12 mx-auto mb-4" />
          <h1 class="text-2xl font-bold text-gray-900">Административная панель</h1>
          <p class="mt-2 text-gray-500">Войдите для управления биллингом</p>
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
          <div class="space-y-4">
            <BaseInput
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="admin@example.com"
              :error="errors.email"
              required
            />

            <BaseInput
              v-model="form.password"
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              :error="errors.password"
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
      </BaseCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { BaseCard, BaseInput, BaseButton, BaseAlert } from '@pg19/ui';
import { useAdminAuthStore } from '~/stores/adminAuth';

definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const adminAuthStore = useAdminAuthStore();
const api = useApi();

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const error = ref('');
const isLoading = ref(false);

function validate(): boolean {
  let isValid = true;
  errors.email = '';
  errors.password = '';

  if (!form.email.trim()) {
    errors.email = 'Введите email';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Введите пароль';
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validate()) return;

  isLoading.value = true;
  error.value = '';

  try {
    // Use Supabase Auth directly through the client
    const { data, error: authError } = await api.client.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (data.session?.access_token && data.user) {
      adminAuthStore.setAuth(
        {
          id: data.user.id,
          email: data.user.email || form.email,
          first_name: data.user.user_metadata?.first_name,
          last_name: data.user.user_metadata?.last_name,
        },
        data.session.access_token
      );

      router.push('/dashboard');
    } else {
      throw new Error('Не удалось получить токен авторизации');
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка авторизации. Проверьте email и пароль.';
  } finally {
    isLoading.value = false;
  }
}
</script>
