export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vee-validate/nuxt',
  ],

  runtimeConfig: {
    directusApiToken: process.env.NUXT_DIRECTUS_API_TOKEN || '',
    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'https://visp.dokasteel.ru/',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'PG19 Billing Admin',
    },
  },

  app: {
    head: {
      title: 'PG19 Billing Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Административная панель биллинга PG19' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-01-01',
});
