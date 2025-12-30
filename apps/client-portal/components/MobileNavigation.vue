<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
    <div class="flex items-center justify-around h-16">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full relative"
        :class="isActive(item.to) ? 'text-primary-600' : 'text-gray-500'"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="absolute top-1 right-1/4 w-4 h-4 bg-accent-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {{ item.badge > 9 ? '9+' : item.badge }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Icons
import HomeIcon from '~/components/icons/HomeIcon.vue';
import WalletIcon from '~/components/icons/WalletIcon.vue';
import LockIcon from '~/components/icons/LockIcon.vue';
import SupportIcon from '~/components/icons/SupportIcon.vue';
import UserIcon from '~/components/icons/UserIcon.vue';

const route = useRoute();

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: number;
}

const props = defineProps<{
  unpaidInvoices?: number;
  openTickets?: number;
}>();

const navItems = computed<NavItem[]>(() => [
  {
    to: '/dashboard',
    label: 'Главная',
    icon: HomeIcon,
  },
  {
    to: '/payment',
    label: 'Оплата',
    icon: WalletIcon,
    badge: props.unpaidInvoices,
  },
  {
    to: '/security',
    label: 'Безопасность',
    icon: LockIcon,
  },
  {
    to: '/support',
    label: 'Помощь',
    icon: SupportIcon,
    badge: props.openTickets,
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: UserIcon,
  },
]);

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
