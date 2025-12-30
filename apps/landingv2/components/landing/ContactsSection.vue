<template>
  <section id="contacts" class="py-20 md:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Свяжитесь с нами
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          Ответим на любые вопросы о подключении
        </p>
      </div>

      <div class="grid lg:grid-cols-5 gap-8">
        <!-- Contact cards -->
        <div class="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          <!-- Phone -->
          <a
            :href="`tel:${companyInfo.phone}`"
            class="group p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white hover:shadow-xl hover:shadow-primary-500/25 transition-all"
          >
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div class="text-sm text-primary-100 mb-1">Бесплатный звонок</div>
            <div class="text-2xl font-bold">{{ companyInfo.phoneFormatted }}</div>
          </a>

          <!-- Telegram -->
          <a
            :href="companyInfo.telegramUrl"
            target="_blank"
            class="group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all"
          >
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div class="text-sm text-gray-500 mb-1">Telegram</div>
            <div class="text-xl font-bold text-gray-900">{{ companyInfo.telegram }}</div>
          </a>

          <!-- Email -->
          <a
            :href="`mailto:${companyInfo.email}`"
            class="group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-secondary-200 hover:shadow-xl transition-all"
          >
            <div class="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-sm text-gray-500 mb-1">Email</div>
            <div class="text-xl font-bold text-gray-900">{{ companyInfo.email }}</div>
          </a>

          <!-- Address -->
          <div class="p-6 bg-white rounded-2xl border-2 border-gray-100">
            <div class="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="text-sm text-gray-500 mb-1">Офис продаж</div>
            <div class="font-bold text-gray-900">{{ companyInfo.address }}</div>
            <div class="text-sm text-gray-500 mt-2">
              {{ companyInfo.workingDays }} {{ companyInfo.workingHours }}
            </div>
          </div>
        </div>

        <!-- CTA Card -->
        <div class="lg:col-span-2">
          <div class="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex flex-col">
            <div class="flex-1">
              <div class="w-16 h-16 bg-secondary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-secondary-500/30">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h3 class="text-2xl font-bold mb-3">
                Подключите интернет сегодня
              </h3>
              <p class="text-gray-400 mb-6">
                Оставьте заявку - перезвоним в течение 15 минут и согласуем удобное время для подключения.
              </p>

              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-2 text-sm">
                  <svg class="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Бесплатное подключение
                </li>
                <li class="flex items-center gap-2 text-sm">
                  <svg class="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Подключение за 1 день
                </li>
                <li class="flex items-center gap-2 text-sm">
                  <svg class="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Без скрытых платежей
                </li>
              </ul>
            </div>

            <a
              href="#hero"
              class="block w-full py-4 bg-secondary-500 hover:bg-secondary-400 text-white font-bold text-center rounded-xl transition-colors shadow-lg shadow-secondary-500/25"
            >
              Оставить заявку
            </a>
          </div>
        </div>
      </div>

      <!-- Coverage areas -->
      <div class="mt-16 text-center">
        <div class="inline-flex flex-wrap justify-center gap-3">
          <span class="text-gray-500">Работаем в:</span>
          <span
            v-for="area in coverageAreas"
            :key="area"
            class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
          >
            {{ area }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { companyInfo, coverageAreas } from '~/data/company';
</script>
