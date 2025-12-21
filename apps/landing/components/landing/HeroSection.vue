<template>
  <section
    id="hero"
    class="relative min-h-screen flex items-center overflow-hidden"
  >
    <!-- Background image -->
    <div class="absolute inset-0">
      <img
        src="/images/hero-bg.jpg"
        alt=""
        class="w-full h-full object-cover"
      />
      <!-- Dark overlay for text readability -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70" />
      <!-- Accent gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent" />
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Content -->
        <div class="text-center lg:text-left space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90">
            <span class="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
            Без ограничений. Без блокировок.
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]">
            Доступ в
            <span class="relative">
              <span class="bg-gradient-to-r from-secondary-400 to-secondary-300 bg-clip-text text-transparent">
                по-настоящему
              </span>
            </span>
            <br />
            <span class="text-white">свободный интернет</span>
          </h1>

          <p class="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0">
            Никаких замедлений YouTube и Discord. Гигабитная скорость 1000 Мбит/с.
            Интернет + 191 ТВ канал — всего 699 ₽/мес.
          </p>

          <!-- Stats row -->
          <div class="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10">
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white flex items-baseline gap-1">
                {{ companyInfo.stats.speed }}
                <span class="text-lg text-secondary-400">Мбит/с</span>
              </div>
              <div class="text-sm text-white/50 mt-1">скорость</div>
            </div>
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white">
                {{ companyInfo.stats.channels }}
              </div>
              <div class="text-sm text-white/50 mt-1">ТВ каналов</div>
            </div>
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white">
                {{ companyInfo.stats.devices }}
              </div>
              <div class="text-sm text-white/50 mt-1">устройств</div>
            </div>
          </div>

          <!-- CTA Buttons (mobile) -->
          <div class="flex flex-col sm:flex-row gap-4 lg:hidden">
            <a
              href="#tariffs"
              class="flex-1 py-4 px-6 bg-secondary-500 hover:bg-secondary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-secondary-500/25 text-center"
            >
              Подключить
            </a>
            <a
              :href="`tel:${companyInfo.phone}`"
              class="flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl transition-all border border-white/20 text-center"
            >
              {{ companyInfo.phoneFormatted }}
            </a>
          </div>
        </div>

        <!-- Address Check Form Card -->
        <div class="lg:pl-4">
          <div class="relative">
            <!-- Glow effect -->
            <div class="absolute -inset-1 bg-gradient-to-r from-secondary-500/50 to-primary-500/50 rounded-3xl blur-xl opacity-50" />

            <div class="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/50">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-secondary-500/30">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">
                    Проверьте адрес
                  </h2>
                  <p class="text-sm text-gray-500">
                    Узнайте о возможности подключения
                  </p>
                </div>
              </div>

              <AddressCheckForm @submit="handleAddressCheck" />

              <p class="mt-4 text-xs text-gray-400 text-center">
                Бесплатная консультация и выезд мастера
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
      <a
        href="#features"
        class="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
      >
        <span class="text-xs uppercase tracking-wider">Подробнее</span>
        <div class="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
          <div class="w-1 h-2 bg-current rounded-full animate-bounce" />
        </div>
      </a>
    </div>

    <!-- Address Check Modal -->
    <AddressCheckModal
      :show="showModal"
      :result="result"
      @close="closeModal"
    />
  </section>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';
import type { AddressData } from '~/composables/useAddressCheck';

const { checkAddress, result, showModal, closeModal } = useAddressCheck();

async function handleAddressCheck(address: AddressData) {
  await checkAddress(address);
}
</script>

