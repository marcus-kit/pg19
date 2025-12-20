<template>
  <div :class="['font-semibold', colorClass, sizeClass]">
    {{ formattedBalance }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  amount: number;        // в копейках
  currency?: string;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'RUB',
  showSign: false,
  size: 'md',
});

const formattedBalance = computed(() => {
  const rubles = props.amount / 100;
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(rubles));

  if (props.showSign && props.amount > 0) return '+' + formatted;
  if (props.amount < 0) return '-' + formatted;
  return formatted;
});

const colorClass = computed(() => {
  if (props.amount > 0) return 'text-secondary-500';
  if (props.amount < 0) return 'text-accent-pink';
  return 'text-gray-700';
});

const sizeClass = computed(() => ({
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
}[props.size]));
</script>
