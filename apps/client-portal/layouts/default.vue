<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
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
          class="hidden md:flex px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="flex-1 pb-20 md:pb-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <slot />
      </div>
    </main>

    <MobileNavigation
      :unpaid-invoices="unpaidInvoicesCount"
      :open-tickets="openTicketsCount"
    />

    <AppFooter company-name="PG19" class="hidden md:block" />
  </div>
</template>

<script setup lang="ts">
import { AppHeader, AppFooter, formatFullName } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import MobileNavigation from '~/components/MobileNavigation.vue';

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
  { to: '/security', label: 'Безопасность' },
  { to: '/services', label: 'Тарифы' },
  { to: '/support', label: 'Поддержка' },
  { to: '/profile', label: 'Профиль' },
];

// These would come from API in real app
const unpaidInvoicesCount = ref(0);
const openTicketsCount = ref(0);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

// Load counts on mount
onMounted(async () => {
  // TODO: Load actual counts from API
});
</script>
