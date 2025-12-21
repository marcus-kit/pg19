<template>
  <div
    class="relative p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer"
    :class="cardClasses"
  >
    <div class="flex flex-col items-center text-center gap-2">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="iconComponent" class="w-6 h-6" :class="iconColorClass" />
      </div>
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
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
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
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

const cardClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'border-primary-200 bg-primary-50 hover:border-primary-300';
    case 'secondary':
      return 'border-secondary-200 bg-secondary-50 hover:border-secondary-300';
    default:
      return 'border-gray-200 bg-white hover:border-gray-300';
  }
});

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-primary-100';
    case 'secondary':
      return 'bg-secondary-100';
    default:
      return 'bg-gray-100';
  }
});

const iconColorClass = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'text-primary-600';
    case 'secondary':
      return 'text-secondary-600';
    default:
      return 'text-gray-600';
  }
});
</script>
