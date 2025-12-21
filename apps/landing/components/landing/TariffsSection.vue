<template>
  <section id="tariffs" class="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Тариф ДОМ-1000
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          Всё что нужно для комфортной жизни в одном пакете
        </p>
      </div>

      <!-- Main tariff card -->
      <div class="max-w-4xl mx-auto">
        <div class="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
          <!-- Badge -->
          <div class="absolute top-6 right-6 z-10">
            <div class="px-4 py-2 bg-gradient-to-r from-accent-pink to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
              Хит продаж
            </div>
          </div>

          <div class="grid lg:grid-cols-2">
            <!-- Left: Price & CTA -->
            <div class="p-8 lg:p-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
              <div class="space-y-6">
                <div>
                  <div class="text-primary-200 text-sm font-medium uppercase tracking-wider mb-2">
                    Ежемесячная плата
                  </div>
                  <div class="flex items-baseline gap-2">
                    <span class="text-6xl lg:text-7xl font-bold">699</span>
                    <span class="text-2xl text-primary-200">₽/мес</span>
                  </div>
                </div>

                <div class="space-y-4 py-6 border-t border-white/20">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold">До 1000 Мбит/с</div>
                      <div class="text-sm text-primary-200">Гигабитная скорость</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold">191 ТВ канал</div>
                      <div class="text-sm text-primary-200">Включено бесплатно</div>
                    </div>
                  </div>
                </div>

                <a
                  href="#hero"
                  class="block w-full py-4 bg-white text-primary-600 font-bold text-center rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                >
                  Подключить
                </a>

                <p class="text-center text-sm text-primary-200">
                  Подключение бесплатно
                </p>
              </div>
            </div>

            <!-- Right: Features -->
            <div class="p-8 lg:p-12">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Что входит в тариф
              </h3>

              <ul class="space-y-4">
                <li v-for="feature in tariff.features" :key="feature" class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
              </ul>

              <!-- Options -->
              <div class="mt-8 pt-6 border-t border-gray-100">
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Дополнительно
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="option in tariff.options"
                    :key="option.name"
                    class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm">{{ option.name }}</span>
                    </div>
                    <div class="text-primary-600 font-semibold">+{{ option.price }} ₽</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TV Channels showcase -->
      <div class="mt-16">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ tvChannels.total }} ТВ каналов включено
          </h3>
          <p class="text-gray-600 mt-2">
            {{ tvChannels.hd }} HD каналов и {{ tvChannels.uhd4k }} канала в 4K качестве
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="category in tvChannels.categories"
            :key="category.name"
            class="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm"
          >
            <span class="text-gray-600">{{ category.name }}</span>
            <span class="ml-2 text-primary-600 font-semibold">{{ category.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { tariffs, tvChannels } from '~/data/tariffs';

const tariff = tariffs[0];
</script>
