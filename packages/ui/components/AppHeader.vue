<template>
  <header class="bg-surface shadow-sm border-b border-border">
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
                <span class="font-semibold text-content">{{ title }}</span>
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
            <span class="text-sm text-content-secondary">{{ user }}</span>
            <button
              type="button"
              class="text-sm px-3 py-1.5 bg-accent-pink text-white rounded-lg hover:bg-pink-700 transition-colors"
              @click="$emit('logout')"
            >
              Выход
            </button>
          </div>

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
}>();
</script>
