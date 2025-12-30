<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="show"
              class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8"
            >
              <!-- Close button -->
              <button
                type="button"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                @click="emit('close')"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Success state -->
              <template v-if="result?.available">
                <div class="text-center">
                  <div class="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">
                    Отлично!
                  </h3>
                  <p class="text-gray-600 mb-6">
                    {{ result.message }}
                  </p>
                  <p class="text-sm text-gray-500 mb-6">
                    {{ result.address.city }}, {{ result.address.street }}, д. {{ result.address.building }}
                  </p>

                  <div class="space-y-3">
                    <a
                      :href="companyInfo.telegramUrl"
                      target="_blank"
                      class="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Оставить заявку в Telegram
                    </a>
                    <a
                      :href="`tel:${companyInfo.phone}`"
                      class="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Позвонить {{ companyInfo.phoneFormatted }}
                    </a>
                  </div>
                </div>
              </template>

              <!-- Unavailable state -->
              <template v-else-if="result">
                <div class="text-center">
                  <div class="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">
                    Пока не подключено
                  </h3>
                  <p class="text-gray-600 mb-6">
                    {{ result.message }}
                  </p>
                  <p class="text-sm text-gray-500 mb-6">
                    {{ result.address.city }}, {{ result.address.street }}, д. {{ result.address.building }}
                  </p>

                  <div class="space-y-3">
                    <a
                      :href="companyInfo.telegramUrl"
                      target="_blank"
                      class="block w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Оставить заявку
                    </a>
                    <button
                      type="button"
                      class="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                      @click="emit('close')"
                    >
                      Проверить другой адрес
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { companyInfo } from '~/data/company';
import type { AddressCheckResult } from '~/composables/useAddressCheck';

interface Props {
  show: boolean;
  result: AddressCheckResult | null;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>
