export interface AddressData {
  city: string;
  street: string;
  building: string;
}

export interface AddressCheckResult {
  available: boolean;
  need_manual_check: boolean;
  address: AddressData;
  message: string;
}

interface ApiResponse {
  available: boolean;
  need_manual_check: boolean;
  message: string;
}

export function useAddressCheck() {
  const isLoading = ref(false);
  const result = ref<AddressCheckResult | null>(null);
  const showModal = ref(false);
  const config = useRuntimeConfig();

  async function checkAddress(address: AddressData): Promise<AddressCheckResult> {
    isLoading.value = true;
    result.value = null;

    try {
      // Вызов внешнего API (rabbitmq-proxy)
      const apiUrl = config.public.mqApiUrl || 'https://mq.dokasteel.ru';
      const response = await $fetch<ApiResponse>(`${apiUrl}/api/check-address`, {
        method: 'POST',
        body: address,
      });

      const checkResult: AddressCheckResult = {
        available: response.available,
        need_manual_check: response.need_manual_check,
        address,
        message: response.message,
      };

      result.value = checkResult;
      showModal.value = true;

      return checkResult;
    } catch (error) {
      // Fallback при ошибке сети/сервера
      const checkResult: AddressCheckResult = {
        available: false,
        need_manual_check: true,
        address,
        message: 'Произошла ошибка при проверке адреса. Пожалуйста, оставьте заявку.',
      };

      result.value = checkResult;
      showModal.value = true;

      return checkResult;
    } finally {
      isLoading.value = false;
    }
  }

  function closeModal() {
    showModal.value = false;
  }

  function reset() {
    result.value = null;
    showModal.value = false;
    isLoading.value = false;
  }

  return {
    isLoading,
    result,
    showModal,
    checkAddress,
    closeModal,
    reset,
  };
}
