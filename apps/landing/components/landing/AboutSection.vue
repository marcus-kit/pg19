<template>
  <section id="about" class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 md:mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
          Почему выбирают нас
        </h2>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          {{ companyInfo.name }} — надёжный интернет-провайдер с многолетним опытом работы в Таганроге
        </p>
      </div>

      <!-- Features grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <FeatureCard
          v-for="feature in companyInfo.features"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
      </div>

      <!-- Stats -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12">
        <div class="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white">
              {{ companyInfo.stats.yearsInBusiness }}+
            </div>
            <div class="text-primary-100 mt-2">лет на рынке</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white">
              {{ companyInfo.stats.customersCount }}+
            </div>
            <div class="text-primary-100 mt-2">довольных клиентов</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white">
              {{ companyInfo.stats.uptimePercent }}%
            </div>
            <div class="text-primary-100 mt-2">uptime сети</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';
</script>
