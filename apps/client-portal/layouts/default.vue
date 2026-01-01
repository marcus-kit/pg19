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
          class="hidden md:flex px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'text-content-secondary hover:text-content hover:bg-surface-sunken'
          ]"
        >
          {{ item.label }}
        </NuxtLink>
      </template>

      <template #actions>
        <ThemeToggle />
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
import { AppHeader, AppFooter, ThemeToggle, formatFullName } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import MobileNavigation from '~/components/MobileNavigation.vue';

const router = useRouter();
const authStore = useAuthStore();
const api = useApi();

const userName = computed(() => {
  if (authStore.user) {
    return formatFullName(authStore.user);
  }
  return '';
});

const navItems = [
  { to: '/dashboard', label: 'Главная' },
  { to: '/invoices', label: 'Счета' },
  { to: '/security', label: 'Безопасность' },
  { to: '/services', label: 'Услуги' },
  { to: '/support', label: 'Поддержка' },
  { to: '/profile', label: 'Профиль' },
];

const unpaidInvoicesCount = ref(0);
// TODO: Load from tickets API when table is created
const openTicketsCount = ref(0);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

// Load counts on mount
onMounted(async () => {
  if (!authStore.account?.id) return;

  try {
    const { data } = await api.getInvoices(authStore.account.id, { limit: 100 });
    unpaidInvoicesCount.value = data.filter(
      inv => inv.status === 'issued' || inv.status === 'overdue'
    ).length;
  } catch (e) {
    console.error('Failed to load invoice count:', e);
  }
});
</script>
