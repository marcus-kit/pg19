<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out',
      'lg:translate-x-0 lg:static lg:inset-auto',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex flex-col h-full">
      <div class="flex items-center gap-3 h-20 px-4 border-b border-gray-200">
        <slot name="logo">
          <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="h-12" />
          <div v-else class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">PG</span>
          </div>
          <span class="font-bold text-xl text-gray-900">{{ title }}</span>
        </slot>
      </div>

      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <slot>
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            :class="[
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              item.active
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="w-5 h-5"
              :class="item.active ? 'text-primary-500' : 'text-gray-400'"
            />
            {{ item.label }}
            <span
              v-if="item.badge"
              class="ml-auto px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
            >
              {{ item.badge }}
            </span>
          </a>
        </slot>
      </nav>

      <div v-if="$slots.footer" class="p-4 border-t border-gray-200">
        <slot name="footer" />
      </div>
    </div>
  </aside>

  <div
    v-if="isOpen"
    class="fixed inset-0 z-30 bg-black/50 lg:hidden"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface MenuItem {
  href: string;
  label: string;
  icon?: Component;
  active?: boolean;
  badge?: string | number;
}

interface Props {
  isOpen?: boolean;
  title?: string;
  logoSrc?: string;
  items?: MenuItem[];
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: 'PG19 Admin',
  items: () => [],
});

defineEmits<{
  close: [];
}>();
</script>
