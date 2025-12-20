<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader
      title="Личный кабинет"
      logo-src="/images/logo.png"
      :user="userName"
      @logout="handleLogout"
    >
      <template #nav>
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="[
            $route.path === item.to
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>

    <AppFooter company-name="PG19" />
  </div>
</template>

<script setup lang="ts">
import { AppHeader, AppFooter } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import { formatFullName } from '@pg19/ui';

const router = useRouter();
const authStore = useAuthStore();

const userName = computed(() => {
  if (authStore.person) {
    return formatFullName(authStore.person);
  }
  return '';
});

const navItems = [
  { to: '/dashboard', label: 'Главная' },
  { to: '/invoices', label: 'Счета' },
  { to: '/transactions', label: 'Операции' },
  { to: '/services', label: 'Сервисы' },
  { to: '/profile', label: 'Профиль' },
];

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
