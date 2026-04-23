import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  const addToast = (options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.value.push({ ...options, id });
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (message: string, title: string = 'Sucesso!') => {
    addToast({ description: message, title, variant: 'success' });
  };

  const error = (message: string, title: string = 'Erro!') => {
    addToast({ description: message, title, variant: 'error' });
  };

  const info = (message: string, title: string = 'Informação') => {
    addToast({ description: message, title, variant: 'info' });
  };

  const warning = (message: string, title: string = 'Atenção!') => {
    addToast({ description: message, title, variant: 'warning' });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
});
