<template>
  <div
    :class="[
      'bg-white rounded-xl shadow-sm',
      padding ? 'p-6' : '',
      hover ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
      border ? 'border border-gray-200' : '',
    ]"
  >
    <div v-if="title || $slots.header" class="mb-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <slot name="header-actions" />
        </div>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
      </slot>
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  padding?: boolean;
  hover?: boolean;
  border?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false,
  border: false,
});
</script>
