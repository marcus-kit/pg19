<template>
  <footer class="bg-slate-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
        <!-- Logo & Description -->
        <div class="col-span-2">
          <img
            src="/images/logo.png"
            alt="ПЖ19"
            class="h-10 w-auto mb-4"
          />
          <p class="text-gray-400 text-sm max-w-sm mb-6">
            Интернет-провайдер в Таганроге, Ростове-на-Дону и Батайске.
            Гигабитный интернет + ТВ по честной цене.
          </p>
          <div class="flex items-center gap-4">
            <a
              :href="companyInfo.telegramUrl"
              target="_blank"
              class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h4 class="font-semibold mb-4">Навигация</h4>
          <ul class="space-y-3">
            <li>
              <a href="#features" class="text-gray-400 hover:text-white text-sm transition-colors">
                Преимущества
              </a>
            </li>
            <li>
              <a href="#tariffs" class="text-gray-400 hover:text-white text-sm transition-colors">
                Тариф
              </a>
            </li>
            <li>
              <a href="#contacts" class="text-gray-400 hover:text-white text-sm transition-colors">
                Контакты
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-semibold mb-4">Контакты</h4>
          <ul class="space-y-3 text-sm">
            <li>
              <a
                :href="`tel:${companyInfo.phone}`"
                class="text-gray-400 hover:text-white transition-colors"
              >
                {{ companyInfo.phoneFormatted }}
              </a>
              <div class="text-xs text-gray-500">бесплатно</div>
            </li>
            <li>
              <a
                :href="`mailto:${companyInfo.email}`"
                class="text-gray-400 hover:text-white transition-colors"
              >
                {{ companyInfo.email }}
              </a>
            </li>
            <li class="text-gray-400">
              {{ companyInfo.address }}
            </li>
            <li class="text-gray-500 text-xs">
              {{ companyInfo.workingDays }} {{ companyInfo.workingHours }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-12 pt-8 border-t border-gray-800">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-gray-500 text-sm text-center sm:text-left">
            &copy; {{ currentYear }} {{ companyInfo.name }}. Все права защищены.
          </p>
          <a
            :href="companyInfo.website"
            target="_blank"
            class="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            taganrog.pg19.ru
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';

const currentYear = new Date().getFullYear();
</script>
