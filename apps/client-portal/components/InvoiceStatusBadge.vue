<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeClasses
    ]"
  >
    <span v-if="showDot" :class="['w-1.5 h-1.5 rounded-full mr-1.5', dotClasses]" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { InvoiceStatus } from '@pg19/types';

interface Props {
  status: InvoiceStatus;
  isOverdue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOverdue: false,
});

const showDot = computed(() => {
  return props.status === 'issued' || props.status === 'overdue' || props.isOverdue;
});

const badgeClasses = computed(() => {
  if (props.isOverdue || props.status === 'overdue') {
    return 'bg-red-100 text-red-700';
  }

  switch (props.status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'issued':
      return 'bg-yellow-100 text-yellow-700';
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-700';
  }
});

const dotClasses = computed(() => {
  if (props.isOverdue || props.status === 'overdue') {
    return 'bg-red-500 animate-pulse';
  }

  switch (props.status) {
    case 'issued':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-400';
  }
});

const label = computed(() => {
  if (props.isOverdue) {
    return 'Просрочен';
  }

  const labels: Record<InvoiceStatus, string> = {
    draft: 'Черновик',
    issued: 'К оплате',
    paid: 'Оплачен',
    overdue: 'Просрочен',
    cancelled: 'Отменён',
  };

  return labels[props.status] || props.status;
});
</script>
