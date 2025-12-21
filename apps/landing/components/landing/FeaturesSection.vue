<template>
  <section id="features" class="py-20 md:py-28 bg-white relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary-50 to-transparent opacity-50" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-700 text-sm font-medium mb-4">
          <span class="text-lg">🏴‍☠️</span>
          Сокровища на борту
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Что в трюме корабля
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          YouTube, Discord, Telegram — всё на полных парусах. Никаких рифов и блокировок на пути.
        </p>
      </div>

      <!-- Features grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <!-- Speed -->
        <div class="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div class="relative">
            <div class="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl">
              ⚡
            </div>
            <div class="text-4xl font-bold mb-1 text-amber-400">1 Гбит/с</div>
            <div class="text-white/80">Полный ход</div>
            <p class="mt-3 text-sm text-white/60">
              Летишь как фрегат под попутным ветром. 1 ГБ за 20 секунд.
            </p>
          </div>
        </div>

        <!-- TV -->
        <div class="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl">
            📺
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-1">191</div>
          <div class="text-gray-600 font-medium">ТВ канал</div>
          <p class="mt-3 text-sm text-gray-500">
            Развлечения в каюте. 23 HD и 2 канала в 4K.
          </p>
        </div>

        <!-- No blocking -->
        <div class="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl">
            ☠️
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-1">0</div>
          <div class="text-gray-600 font-medium">Рифов на пути</div>
          <p class="mt-3 text-sm text-gray-500">
            YouTube, Discord, Telegram — чистая вода!
          </p>
        </div>

        <!-- Price -->
        <div class="group relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white overflow-hidden">
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div class="relative">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl">
              💰
            </div>
            <div class="text-4xl font-bold mb-1">699 ₽</div>
            <div class="text-white/90">В месяц</div>
            <p class="mt-3 text-sm text-white/70">
              Честная добыча. Без скрытых платежей.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional info -->
      <div class="mt-12 bg-slate-900 rounded-2xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
              🧭
            </div>
            <div>
              <div class="font-semibold text-white">Снаряжение для команды</div>
              <div class="text-sm text-gray-400">Wi-Fi роутер или ТВ приставка — всего +99 дублонов/мес</div>
            </div>
          </div>
          <a
            href="#tariffs"
            class="whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-colors"
          >
            🏴‍☠️ На абордаж!
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
