<template>
  <div
    :class="[
      'rounded-lg p-4',
      variantClasses,
    ]"
    role="alert"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <component :is="icon" class="h-5 w-5" :class="iconColorClass" />
      </div>
      <div class="ml-3">
        <h3 v-if="title" class="text-sm font-medium" :class="titleColorClass">
          {{ title }}
        </h3>
        <div :class="['text-sm', title ? 'mt-2' : '', contentColorClass]">
          <slot>{{ message }}</slot>
        </div>
        <div v-if="$slots.actions" class="mt-4">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          type="button"
          class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="dismissButtonClasses"
          @click="$emit('dismiss')"
        >
          <span class="sr-only">Закрыть</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';

interface Props {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
});

defineEmits<{
  dismiss: [];
}>();

const variantClasses = computed(() => ({
  info: 'bg-primary-50 dark:bg-primary-900/30',
  success: 'bg-green-50 dark:bg-green-900/30',
  warning: 'bg-orange-50 dark:bg-orange-900/30',
  error: 'bg-pink-50 dark:bg-pink-900/30',
}[props.variant]));

const iconColorClass = computed(() => ({
  info: 'text-primary-400 dark:text-primary-300',
  success: 'text-green-400 dark:text-green-300',
  warning: 'text-orange-400 dark:text-orange-300',
  error: 'text-accent-pink dark:text-pink-300',
}[props.variant]));

const titleColorClass = computed(() => ({
  info: 'text-primary-800 dark:text-primary-200',
  success: 'text-green-800 dark:text-green-200',
  warning: 'text-orange-800 dark:text-orange-200',
  error: 'text-pink-800 dark:text-pink-200',
}[props.variant]));

const contentColorClass = computed(() => ({
  info: 'text-primary-700 dark:text-primary-300',
  success: 'text-green-700 dark:text-green-300',
  warning: 'text-orange-700 dark:text-orange-300',
  error: 'text-pink-700 dark:text-pink-300',
}[props.variant]));

const dismissButtonClasses = computed(() => ({
  info: 'bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/50 focus:ring-primary-500',
  success: 'bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50 focus:ring-green-500',
  warning: 'bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/50 focus:ring-orange-500',
  error: 'bg-pink-50 dark:bg-pink-900/50 text-pink-500 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-800/50 focus:ring-pink-500',
}[props.variant]));

const icons = {
  info: h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
      'clip-rule': 'evenodd',
    }),
  ]),
  success: h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
      'clip-rule': 'evenodd',
    }),
  ]),
  warning: h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z',
      'clip-rule': 'evenodd',
    }),
  ]),
  error: h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
      'clip-rule': 'evenodd',
    }),
  ]),
};

const icon = computed(() => icons[props.variant]);
</script>
