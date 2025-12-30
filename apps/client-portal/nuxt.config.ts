export default defineNuxtConfig({
  devtools: { enabled: true },

  components: [
    {
      path: '~/components/auth',
      pathPrefix: false, // Use component names without 'Auth' prefix
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vee-validate/nuxt',
  ],

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Личный кабинет PG19',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      asteriskVerifyNumber: process.env.NUXT_PUBLIC_ASTERISK_VERIFY_NUMBER || '+78634431431',
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME || '',
    },
  },

  app: {
    head: {
      title: 'Личный кабинет PG19',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Личный кабинет абонента PG19' },
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

  compatibilityDate: '2024-12-31',
});
