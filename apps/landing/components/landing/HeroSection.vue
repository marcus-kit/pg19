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
      <!-- Dark overlay for text readability - more transparent to show the ship -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
      <!-- Accent gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent" />
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Content -->
        <div class="text-center lg:text-left space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90">
            <span class="text-lg">⚓</span>
            Свободное плавание по сети
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]">
            <span class="text-white/90">Поднимай паруса!</span>
            <br />
            <span class="relative">
              <span class="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Свободный интернет
              </span>
            </span>
            <br />
            <span class="text-white/80 text-3xl sm:text-4xl lg:text-5xl">без блокировок ☠️</span>
          </h1>

          <p class="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0">
            Плыви куда хочешь — YouTube, Discord, Telegram на полной скорости.
            Никаких рифов и мелей. 1000 Мбит/с за 699 ₽/мес.
          </p>

          <!-- Stats row -->
          <div class="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10">
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white flex items-baseline gap-1">
                {{ companyInfo.stats.speed }}
                <span class="text-lg text-amber-400">Мбит/с</span>
              </div>
              <div class="text-sm text-white/50 mt-1">⚡ скорость</div>
            </div>
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white">
                {{ companyInfo.stats.channels }}
              </div>
              <div class="text-sm text-white/50 mt-1">📺 ТВ каналов</div>
            </div>
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold text-white">
                0
              </div>
              <div class="text-sm text-white/50 mt-1">🚫 блокировок</div>
            </div>
          </div>

          <!-- CTA Buttons (mobile) -->
          <div class="flex flex-col sm:flex-row gap-4 lg:hidden">
            <a
              href="#tariffs"
              class="flex-1 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25 text-center"
            >
              🏴‍☠️ На абордаж!
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

            <div class="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-amber-200/50">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 text-2xl">
                  🧭
                </div>
                <p class="text-lg text-gray-800">
                  <strong>Проложи курс — проверь, доходит ли сигнал до твоего порта!</strong>
                </p>
              </div>

              <AddressCheckForm @submit="handleAddressCheck" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
      <a
        href="#features"
        class="flex flex-col items-center gap-2 text-white/20 hover:text-white/40 transition-colors"
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

