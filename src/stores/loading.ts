import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const message = ref('Carregando...');

  const showLoading = (msg?: string) => {
    message.value = msg || 'Carregando...';
    isLoading.value = true;
  };

  const hideLoading = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    message,
    showLoading,
    hideLoading,
  };
});
