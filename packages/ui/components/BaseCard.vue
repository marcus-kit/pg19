<template>
  <div
    :class="[
      'bg-surface rounded-xl shadow-sm',
      padding ? 'p-6' : '',
      hover ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
      border ? 'border border-border' : '',
    ]"
  >
    <div v-if="title || $slots.header" class="mb-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-content">{{ title }}</h3>
          <slot name="header-actions" />
        </div>
        <p v-if="subtitle" class="mt-1 text-sm text-content-secondary">{{ subtitle }}</p>
      </slot>
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-border">
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
