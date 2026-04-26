import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const message = ref('Carregando...');

  const showLoading = (msg?: string): void => {
    message.value = msg || 'Carregando...';
    isLoading.value = true;
  };

  const hideLoading = (): void => {
    isLoading.value = false;
  };

  return {
    isLoading,
    message,
    showLoading,
    hideLoading
  };
});
