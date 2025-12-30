<template>
  <div>
    <HeroSection />
    <FeaturesSection />
    <TariffsSection />
    <ContactsSection />
    <ChatWidget />
  </div>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';

// Structured data for SEO
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'InternetServiceProvider',
        name: companyInfo.name,
        url: companyInfo.website,
        telephone: companyInfo.phone,
        email: companyInfo.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Таганрог',
          streetAddress: 'ул. Большая Бульварная, 11',
          addressCountry: 'RU',
        },
        areaServed: [
          { '@type': 'City', name: 'Таганрог' },
          { '@type': 'City', name: 'Ростов-на-Дону' },
          { '@type': 'City', name: 'Батайск' },
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '20:00',
          },
        ],
        sameAs: [companyInfo.telegramUrl],
        priceRange: 'от 699₽/мес',
      }),
    },
  ],
});
</script>
