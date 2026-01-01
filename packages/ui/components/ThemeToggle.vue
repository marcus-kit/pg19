<template>
  <button
    type="button"
    class="relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
    :class="[
      isDark
        ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
    ]"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    @click="toggle"
  >
    <!-- Sun icon (light mode) -->
    <svg
      v-if="isDark"
      class="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- Moon icon (dark mode) -->
    <svg
      v-else
      class="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'pg19-theme';

const isDark = ref(false);

// Initialize theme from localStorage or system preference
onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    isDark.value = stored === 'dark';
  } else {
    // Respect system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyTheme();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      isDark.value = e.matches;
      applyTheme();
    }
  });
});

function toggle() {
  isDark.value = !isDark.value;
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
  applyTheme(true);
}

function applyTheme(withTransition = false) {
  const html = document.documentElement;

  if (withTransition) {
    html.classList.add('theme-transition');
  }

  if (isDark.value) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  if (withTransition) {
    // Remove transition class after animation completes
    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 300);
  }
}

// Expose for parent components
defineExpose({ isDark, toggle });
</script>
