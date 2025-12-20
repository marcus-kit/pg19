<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg
        class="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :class="[
        'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
        'transition-colors',
      ]"
      @input="handleInput"
      @keydown.enter="$emit('search', modelValue)"
    />
    <button
      v-if="modelValue && clearable"
      type="button"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      @click="clear"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <BaseSpinner
      v-if="loading"
      class="absolute inset-y-0 right-3 my-auto text-gray-400"
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  debounce?: number;
  clearable?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск...',
  debounce: 300,
  clearable: true,
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  search: [value: string];
}>();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    emit('search', value);
  }, props.debounce);
}

function clear() {
  emit('update:modelValue', '');
  emit('search', '');
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>
