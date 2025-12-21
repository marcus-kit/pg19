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

          <!-- CTA Button -->
          <a
            href="https://pg19-client.vercel.app"
            target="_blank"
            :class="[
              'hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              isScrolled
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
                : 'bg-white text-primary-600 hover:bg-white/90',
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Личный кабинет
          </a>

          <!-- Mobile menu button -->
          <button
            type="button"
            class="lg:hidden p-2 rounded-lg transition-colors"
            :class="isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden bg-white border-t border-gray-100 shadow-xl"
      >
        <nav class="px-4 py-4 space-y-1">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </a>
          <div class="pt-4 border-t border-gray-100 space-y-3">
            <a
              :href="`tel:${companyInfo.phone}`"
              class="flex items-center gap-3 px-4 py-3 text-gray-700"
            >
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="font-semibold">{{ companyInfo.phoneFormatted }}</span>
              <span class="text-xs text-gray-400">бесплатно</span>
            </a>
            <a
              href="https://pg19-client.vercel.app"
              target="_blank"
              class="flex items-center justify-center gap-2 w-full py-4 bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25"
              @click="isMobileMenuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Личный кабинет
            </a>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

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
