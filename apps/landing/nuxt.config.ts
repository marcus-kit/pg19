export default defineNuxtConfig({
  devtools: { enabled: true },

  components: [
    {
      path: '~/components/landing',
      pathPrefix: false,
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vee-validate/nuxt',
  ],

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'PG19',
      clientPortalUrl: process.env.NUXT_PUBLIC_CLIENT_PORTAL_URL || 'https://pg19-client.vercel.app',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'PG19 — Высокоскоростной интернет в Таганроге',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Подключение интернета в Таганроге от PG19. Скорость до 200 Мбит/с. Подключение за 1 день. Проверьте доступность по вашему адресу!' },
        { name: 'keywords', content: 'интернет таганрог, провайдер таганрог, подключить интернет, PG19, домашний интернет' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'PG19 — Высокоскоростной интернет в Таганроге' },
        { property: 'og:description', content: 'Подключение интернета от 400 руб/мес. Скорость до 200 Мбит/с. Подключение за 1 день.' },
        { property: 'og:image', content: '/images/og-image.png' },
        { property: 'og:locale', content: 'ru_RU' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'PG19 — Интернет в Таганроге' },
        { name: 'twitter:description', content: 'Подключение интернета от 400 руб/мес' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
