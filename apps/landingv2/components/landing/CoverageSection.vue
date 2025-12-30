<template>
  <section id="coverage" class="py-16 md:py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 md:mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
          Зона покрытия
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Мы работаем в большинстве районов Таганрога.
          Проверьте доступность по вашему адресу.
        </p>
      </div>

      <!-- Coverage areas grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div
          v-for="area in coverageAreas"
          :key="area.district"
          class="bg-white rounded-xl p-6 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ area.district }}</h3>
              <span class="text-xs text-secondary-500">
                {{ connectionTypes[area.connectionType] }}
              </span>
            </div>
          </div>
          <ul class="space-y-1">
            <li
              v-for="street in area.streets"
              :key="street"
              class="text-sm text-gray-600 flex items-center gap-2"
            >
              <span class="w-1 h-1 bg-gray-400 rounded-full" />
              ул. {{ street }}
            </li>
          </ul>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <p class="text-gray-600 mb-4">
          Не нашли свою улицу? Проверьте точный адрес
        </p>
        <a
          href="#hero"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Проверить адрес
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { coverageAreas, connectionTypes } from '~/data/coverage';
</script>
