<template>
  <div
    class="relative rounded-xl border-2 transition-all hover:shadow-md cursor-pointer"
    :class="[cardClasses, sizeClasses]"
  >
    <div class="flex flex-col items-center text-center gap-2">
      <div
        class="rounded-full flex items-center justify-center"
        :class="[iconBgClass, iconSizeClass]"
      >
        <component :is="iconComponent" :class="iconColorClass" />
      </div>
      <span :class="labelClass">{{ label }}</span>
    </div>

    <!-- Badge -->
    <div
      v-if="badge"
      class="absolute -top-1 -right-1 w-5 h-5 bg-accent-pink text-white text-xs font-bold rounded-full flex items-center justify-center"
    >
      {{ badge > 9 ? '9+' : badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

interface Props {
  icon: 'wallet' | 'history' | 'support' | 'user' | 'document' | 'settings';
  label: string;
  badge?: number;
  color?: 'primary' | 'secondary' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  emphasized?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
  size: 'md',
  emphasized: false,
});

const iconComponents = {
  wallet: defineAsyncComponent(() => import('../icons/WalletIcon.vue')),
  history: defineAsyncComponent(() => import('../icons/HistoryIcon.vue')),
  support: defineAsyncComponent(() => import('../icons/SupportIcon.vue')),
  user: defineAsyncComponent(() => import('../icons/UserIcon.vue')),
  document: defineAsyncComponent(() => import('../icons/DocumentIcon.vue')),
  settings: defineAsyncComponent(() => import('../icons/SettingsIcon.vue')),
};

const iconComponent = computed(() => iconComponents[props.icon]);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-3';
    case 'lg':
      return 'p-6';
    default:
      return 'p-4';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5';
    case 'lg':
      return 'w-16 h-16 [&>svg]:w-8 [&>svg]:h-8';
    default:
      return 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6';
  }
});

const labelClass = computed(() => {
  const base = 'font-medium text-gray-700 dark:text-gray-200';
  switch (props.size) {
    case 'sm':
      return `${base} text-xs`;
    case 'lg':
      return `${base} text-base`;
    default:
      return `${base} text-sm`;
  }
});

const cardClasses = computed(() => {
  if (props.emphasized) {
    // Emphasized version - more vibrant
    switch (props.color) {
      case 'primary':
        return 'border-primary-400 bg-primary-100 hover:border-primary-500 dark:border-primary-500 dark:bg-primary-900/40 dark:hover:border-primary-400 shadow-sm';
      case 'secondary':
        return 'border-secondary-400 bg-secondary-100 hover:border-secondary-500 dark:border-secondary-500 dark:bg-secondary-900/40 dark:hover:border-secondary-400 shadow-sm';
      default:
        return 'border-gray-300 bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-slate-700 dark:hover:border-gray-500 shadow-sm';
    }
  }

  // Normal version
  switch (props.color) {
    case 'primary':
      return 'border-primary-200 bg-primary-50 hover:border-primary-300 dark:border-primary-700 dark:bg-primary-900/20 dark:hover:border-primary-600';
    case 'secondary':
      return 'border-secondary-200 bg-secondary-50 hover:border-secondary-300 dark:border-secondary-700 dark:bg-secondary-900/20 dark:hover:border-secondary-600';
    default:
      return 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-slate-800 dark:hover:border-gray-600';
  }
});

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-primary-100 dark:bg-primary-800/50';
    case 'secondary':
      return 'bg-secondary-100 dark:bg-secondary-800/50';
    default:
      return 'bg-gray-100 dark:bg-slate-700';
  }
});

const iconColorClass = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'text-primary-600 dark:text-primary-400';
    case 'secondary':
      return 'text-secondary-600 dark:text-secondary-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
});
</script>
