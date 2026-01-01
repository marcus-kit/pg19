<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center gap-4 p-6
           bg-gradient-to-r from-primary-50 to-primary-100
           dark:from-slate-800 dark:to-slate-700
           rounded-2xl"
  >
    <!-- Avatar -->
    <div
      class="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0
             bg-primary-100 dark:bg-primary-900/30
             flex items-center justify-center"
    >
      <span class="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
        {{ initials }}
      </span>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
        {{ fullName }}
      </h1>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Договор #{{ contractNumber }}
        </span>
        <StatusBadge :status="accountStatus" type="account" />
      </div>
    </div>

    <!-- Action -->
    <div class="sm:ml-auto">
      <BaseButton variant="outline" size="sm" @click="$emit('edit')">
        <PencilIcon class="w-4 h-4 mr-2" />
        Редактировать
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseButton, StatusBadge } from '@pg19/ui';
import PencilIcon from '~/components/icons/PencilIcon.vue';

interface Props {
  fullName: string;
  initials: string;
  contractNumber: string | number;
  accountStatus: string;
}

defineProps<Props>();

defineEmits<{
  edit: [];
}>();
</script>
