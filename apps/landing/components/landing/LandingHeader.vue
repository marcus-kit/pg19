<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm'
        : 'bg-transparent',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <a href="#hero" class="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="ПЖ19"
            class="h-8 md:h-10 w-auto"
          />
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-10">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            :class="[
              'text-base font-medium transition-colors',
              isScrolled
                ? 'text-gray-600 hover:text-primary-500'
                : 'text-white/80 hover:text-white',
            ]"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Phone (desktop) -->
          <a
            :href="`tel:${companyInfo.phone}`"
            :class="[
              'hidden md:flex items-center gap-2 text-lg font-semibold transition-colors',
              isScrolled
                ? 'text-gray-700'
                : 'text-white',
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ companyInfo.phoneFormatted }}
          </a>

          <!-- CTA Button - visible on all screen sizes -->
          <a
            href="https://pg19-client.vercel.app"
            target="_blank"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold transition-all',
              isScrolled
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
                : 'bg-white text-primary-600 hover:bg-white/90',
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="hidden sm:inline">Личный кабинет</span>
            <span class="sm:hidden">Войти</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';

const isScrolled = ref(false);

const navItems = [
  { label: 'Преимущества', href: '#features' },
  { label: 'Тариф', href: '#tariffs' },
  { label: 'Контакты', href: '#contacts' },
];

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>
