<template>
  <section id="features" class="py-20 md:py-28 bg-white relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-50 to-transparent opacity-50" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 rounded-full text-secondary-600 text-sm font-medium mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Свобода без ограничений
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Почему выбирают нас
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          YouTube, Discord, Telegram — всё работает на полной скорости. Без замедлений и блокировок.
        </p>
      </div>

      <!-- Features grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <!-- Speed -->
        <div class="group relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="relative">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="text-4xl font-bold mb-1">1 Гбит/с</div>
            <div class="text-white/80">Скорость интернета</div>
            <p class="mt-3 text-sm text-white/60">
              Скачивайте файлы мгновенно. 1 ГБ за 20 секунд.
            </p>
          </div>
        </div>

        <!-- TV -->
        <div class="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-gradient-to-br from-accent-pink to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-1">191</div>
          <div class="text-gray-600 font-medium">ТВ канал</div>
          <p class="mt-3 text-sm text-gray-500">
            Включено бесплатно. 23 HD и 2 канала в 4K.
          </p>
        </div>

        <!-- No blocking -->
        <div class="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-1">0</div>
          <div class="text-gray-600 font-medium">Блокировок</div>
          <p class="mt-3 text-sm text-gray-500">
            YouTube, Discord, Telegram — без замедлений.
          </p>
        </div>

        <!-- Price -->
        <div class="group relative bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white overflow-hidden">
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div class="relative">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-4xl font-bold mb-1">699 ₽</div>
            <div class="text-white/80">В месяц</div>
            <p class="mt-3 text-sm text-white/60">
              Интернет + ТВ. Без скрытых платежей.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional info -->
      <div class="mt-12 bg-gray-50 rounded-2xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">Дополнительное оборудование</div>
              <div class="text-sm text-gray-600">Wi-Fi роутер или ТВ приставка — всего +99 ₽/мес</div>
            </div>
          </div>
          <a
            href="#tariffs"
            class="whitespace-nowrap px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            Подробнее о тарифе
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
