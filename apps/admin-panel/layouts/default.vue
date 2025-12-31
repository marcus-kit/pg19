<template>
  <div class="min-h-screen flex">
    <AppSidebar
      :is-open="sidebarOpen"
      title="BSS"
      logo-src="/images/logo.png"
      @close="sidebarOpen = false"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="[
          isActive(item.to)
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100'
        ]"
        @click="sidebarOpen = false"
      >
        <component
          :is="item.icon"
          class="w-5 h-5"
          :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400'"
        />
        {{ item.label }}
      </NuxtLink>
    </AppSidebar>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            type="button"
            class="p-2 text-gray-500 hover:text-gray-700"
            @click="sidebarOpen = true"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/images/logo.png" alt="PG19" class="h-6" />
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            @click="handleLogout"
          >
            Выход
          </button>
        </div>
      </header>

      <header class="hidden lg:flex bg-white shadow-sm border-b border-gray-200">
        <div class="flex-1 flex items-center justify-between h-16 px-6">
          <div>
            <slot name="header-title" />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ adminEmail }}</span>
            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="handleLogout"
            >
              Выход
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppSidebar } from '@pg19/ui';
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  BoltIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline';
import { useAdminAuthStore } from '~/stores/adminAuth';

const route = useRoute();
const router = useRouter();
const adminAuthStore = useAdminAuthStore();

const sidebarOpen = ref(false);

const adminEmail = computed(() => adminAuthStore.user?.email || 'Admin');

const navItems = [
  { to: '/dashboard', label: 'Главная', icon: HomeIcon },
  { to: '/users', label: 'Клиенты', icon: UsersIcon },
  { to: '/accounts', label: 'Учётные записи', icon: CreditCardIcon },
  { to: '/invoices', label: 'Счета', icon: DocumentTextIcon },
  { to: '/services', label: 'Сервисы', icon: BoltIcon },
  { to: '/payments', label: 'Платежи', icon: BanknotesIcon },
  { to: '/transactions', label: 'Операции', icon: ArrowsRightLeftIcon },
  { to: '/reports', label: 'Отчёты', icon: ChartBarIcon },
];

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}

function handleLogout() {
  adminAuthStore.logout();
  router.push('/login');
}
</script>
