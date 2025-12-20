<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      sizeClasses,
      variantClasses,
    ]"
  >
    <span
      v-if="dot"
      :class="['rounded-full mr-1.5', dotSizeClass, dotColorClass]"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'gray',
  size: 'md',
  dot: false,
});

const sizeClasses = computed(() => ({
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
}[props.size]));

const variantClasses = computed(() => ({
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  danger: 'bg-pink-100 text-accent-pink',
  gray: 'bg-gray-100 text-gray-800',
}[props.variant]));

const dotSizeClass = computed(() => ({
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}[props.size]));

const dotColorClass = computed(() => ({
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  danger: 'bg-accent-pink',
  gray: 'bg-gray-500',
}[props.variant]));
</script>
