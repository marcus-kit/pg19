<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>&copy; {{ currentYear }} {{ companyName }}</span>
          <span v-if="version" class="text-gray-400">v{{ version }}</span>
        </div>

        <nav v-if="links.length > 0" class="flex items-center gap-4">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {{ link.label }}
          </a>
        </nav>

        <div v-if="$slots.default" class="text-sm text-gray-500">
          <slot />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface FooterLink {
  href: string;
  label: string;
}

interface Props {
  companyName?: string;
  version?: string;
  links?: FooterLink[];
}

const props = withDefaults(defineProps<Props>(), {
  companyName: 'PG19',
  links: () => [],
});

const currentYear = computed(() => new Date().getFullYear());
</script>
