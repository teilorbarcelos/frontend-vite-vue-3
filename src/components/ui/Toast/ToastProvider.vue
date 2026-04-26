<script setup lang="ts">
import { useToastStore } from '@/stores/toast';
import {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastProgress,
  ToastIcon
} from './index';
import { ref } from 'vue';

const toastStore = useToastStore();

const toastState = ref<Record<string, boolean>>({});

const handleOpenChange = (id: string, isOpen: boolean): void => {
  toastState.value[id] = isOpen;
  /* v8 ignore start */
  if (!isOpen) {
    setTimeout(() => {
      toastStore.removeToast(id);
      delete toastState.value[id];
    }, 500); // Animation duration is 500ms
  }
  /* v8 ignore stop */
};
</script>

<template>
  <ToastProvider swipe-direction="right">
    <slot />

    <template v-for="toast in toastStore.toasts" :key="toast.id">
      <ToastRoot
        :open="toastState[toast.id] ?? true"
        @update:open="handleOpenChange(toast.id, $event)"
        :variant="toast.variant"
        :duration="toast.duration || 3000"
      >
        <div class="flex gap-3 items-start">
          <ToastIcon :variant="toast.variant" />
          <div class="grid gap-1">
            <ToastTitle v-if="toast.title">{{ toast.title }}</ToastTitle>
            <ToastDescription v-if="toast.description">{{ toast.description }}</ToastDescription>
          </div>
        </div>
        <ToastClose
          class="absolute right-2 top-2 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </ToastClose>
        <ToastProgress :duration="toast.duration || 3000" :variant="toast.variant" />
      </ToastRoot>
    </template>

    <ToastViewport />
  </ToastProvider>
</template>
