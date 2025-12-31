<template>
  <BaseBadge :variant="badgeVariant" :dot="showDot">
    {{ statusLabel }}
  </BaseBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseBadge from './BaseBadge.vue';

interface Props {
  status: string;
  type?: 'person' | 'user' | 'contract' | 'account' | 'subscription' | 'payment' | 'invoice';
  showDot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'account',
  showDot: true,
});

const statusConfig: Record<string, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' }> = {
  // Person / Account statuses
  active: { label: 'Активен', variant: 'success' },
  suspended: { label: 'Приостановлен', variant: 'warning' },
  terminated: { label: 'Расторгнут', variant: 'danger' },
  blocked: { label: 'Заблокирован', variant: 'danger' },
  closed: { label: 'Закрыт', variant: 'gray' },

  // Contract statuses
  draft: { label: 'Черновик', variant: 'gray' },

  // Subscription statuses
  paused: { label: 'Приостановлена', variant: 'warning' },
  cancelled: { label: 'Отменена', variant: 'gray' },

  // Payment statuses
  pending: { label: 'Ожидает', variant: 'warning' },
  succeeded: { label: 'Успешно', variant: 'success' },
  failed: { label: 'Ошибка', variant: 'danger' },
  refunded: { label: 'Возвращён', variant: 'gray' },

  // Invoice statuses
  issued: { label: 'Выставлен', variant: 'primary' },
  paid: { label: 'Оплачен', variant: 'success' },
  overdue: { label: 'Просрочен', variant: 'danger' },
};

const statusLabel = computed(() => statusConfig[props.status]?.label || props.status);
const badgeVariant = computed(() => statusConfig[props.status]?.variant || 'gray');
</script>
