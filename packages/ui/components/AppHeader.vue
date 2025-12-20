<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-4">
          <slot name="logo">
            <a href="/" class="flex items-center gap-2">
              <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="h-8" />
              <template v-else>
                <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-sm">PG</span>
                </div>
                <span class="font-semibold text-gray-900">{{ title }}</span>
              </template>
            </a>
          </slot>
          <nav v-if="$slots.nav" class="hidden md:flex items-center gap-1">
            <slot name="nav" />
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <slot name="actions" />

          <div v-if="user" class="flex items-center gap-3">
            <span class="text-sm text-gray-700">{{ user }}</span>
            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="$emit('logout')"
            >
              Выход
            </button>
          </div>

          <button
            type="button"
            class="md:hidden p-2 text-gray-500 hover:text-gray-700"
            @click="$emit('toggle-menu')"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  user?: string;
  logoSrc?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'PG19',
});

defineEmits<{
  logout: [];
  'toggle-menu': [];
}>();
</script>
