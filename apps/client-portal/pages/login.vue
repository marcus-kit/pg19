<template>
  <NuxtLayout name="guest">
    <div class="w-full max-w-md">
      <BaseCard>
        <div class="text-center mb-8">
          <img src="/images/logo.png" alt="PG19" class="h-12 mx-auto mb-4" />
          <h1 class="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <p class="mt-2 text-gray-500">Войдите для управления услугами</p>
        </div>

        <!-- Auth Method Tabs -->
        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="[
                'flex-1 py-3 px-2 text-sm font-medium text-center border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
              @click="activeTab = tab.id"
            >
              <span class="flex flex-col items-center gap-1">
                <component :is="tab.icon" class="w-5 h-5" />
                <span class="hidden sm:inline">{{ tab.label }}</span>
                <span class="sm:hidden">{{ tab.shortLabel }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <Transition name="fade" mode="out-in">
          <ContractAuthForm
            v-if="activeTab === 'contract'"
            key="contract"
            @success="handleAuthSuccess"
          />
          <PhoneAuthForm
            v-else-if="activeTab === 'phone'"
            key="phone"
            @success="handleAuthSuccess"
          />
          <EmailAuthForm
            v-else-if="activeTab === 'email'"
            key="email"
            @success="handleAuthSuccess"
          />
          <TelegramAuthForm
            v-else-if="activeTab === 'telegram'"
            key="telegram"
            @success="handleAuthSuccess"
          />
        </Transition>
      </BaseCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { BaseCard } from '@pg19/ui';
import { useAuthStore } from '~/stores/auth';
import type { Person, Contract, Account } from '@pg19/types';

// Icons as inline components
const ContractIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>`,
};

const PhoneIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>`,
};

const EmailIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>`,
};

const TelegramIcon = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>`,
};

definePageMeta({
  layout: false,
  middleware: 'auth',
});

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref<'contract' | 'phone' | 'email' | 'telegram'>('telegram');

const tabs = [
  { id: 'telegram' as const, label: 'Telegram', shortLabel: 'TG', icon: TelegramIcon },
  { id: 'contract' as const, label: 'Договор', shortLabel: 'Договор', icon: ContractIcon },
  { id: 'phone' as const, label: 'Телефон', shortLabel: 'Тел.', icon: PhoneIcon },
  { id: 'email' as const, label: 'Email', shortLabel: 'Email', icon: EmailIcon },
];

function handleAuthSuccess(data: unknown) {
  const authData = data as {
    person?: Person;
    contract?: Contract;
    account?: Account;
  };
  if (authData.person && authData.contract && authData.account) {
    authStore.setAuth(
      authData.person,
      authData.contract,
      authData.account
    );
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
