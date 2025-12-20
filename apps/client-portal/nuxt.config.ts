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
    // Private keys (only available server-side)
    directusApiToken: process.env.DIRECTUS_API_TOKEN || '',

    // Phone Auth (Asterisk)
    asteriskAmiHost: process.env.ASTERISK_AMI_HOST || '',
    asteriskAmiPort: process.env.ASTERISK_AMI_PORT || '5038',
    asteriskAmiUsername: process.env.ASTERISK_AMI_USERNAME || '',
    asteriskAmiSecret: process.env.ASTERISK_AMI_SECRET || '',
    asteriskCdrTimeout: parseInt(process.env.ASTERISK_CDR_TIMEOUT || '180000'),

    // Email Auth (SMTP)
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFromName: process.env.SMTP_FROM_NAME || 'PG19',
    smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
    emailCodeExpiry: parseInt(process.env.EMAIL_CODE_EXPIRY || '300000'),

    // Telegram Auth
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',

    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'https://visp.dokasteel.ru/',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Личный кабинет PG19',
      asteriskVerifyNumber: process.env.ASTERISK_VERIFY_NUMBER || '+78634431431',
      telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
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

  compatibilityDate: '2024-01-01',
});
