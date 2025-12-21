import { coveredStreets } from '~/data/coverage';

export interface AddressData {
  city: string;
  street: string;
  building: string;
}

export interface AddressCheckResult {
  available: boolean;
  address: AddressData;
  message: string;
}

export function useAddressCheck() {
  const isLoading = ref(false);
  const result = ref<AddressCheckResult | null>(null);
  const showModal = ref(false);

  async function checkAddress(address: AddressData): Promise<AddressCheckResult> {
    isLoading.value = true;
    result.value = null;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock logic: check if street contains any covered street name
    const isAvailable = coveredStreets.some((street) =>
      address.street.toLowerCase().includes(street.toLowerCase())
    );

    const checkResult: AddressCheckResult = {
      available: isAvailable,
      address,
      message: isAvailable
        ? 'Поздравляем! Подключение по вашему адресу доступно.'
        : 'К сожалению, ваш адрес пока не в зоне покрытия. Оставьте заявку, и мы свяжемся с вами.',
    };

    result.value = checkResult;
    isLoading.value = false;
    showModal.value = true;

    return checkResult;
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
