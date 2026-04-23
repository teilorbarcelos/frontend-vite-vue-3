<script setup lang="ts">
import { cn } from '@/utils/cn';
import { ToastRoot, type ToastRootProps } from 'radix-vue';

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface Props extends ToastRootProps {
  class?: string;
  variant?: ToastVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const emit = defineEmits<{
  'update:open': [value: boolean]
}>();
</script>

<template>
  <ToastRoot
    v-bind="props"
    @update:open="emit('update:open', $event)"
    :class="cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=closed]:duration-500',
      {
        'bg-white text-gray-950 border-gray-200': variant === 'default',
        'bg-white border-green-100 text-green-900': variant === 'success',
        'bg-white border-red-100 text-red-900': variant === 'error',
        'bg-white border-yellow-100 text-yellow-900': variant === 'warning',
        'bg-white border-blue-100 text-blue-900': variant === 'info',
      },
      props.class
    )"
  >
    <slot />
  </ToastRoot>
</template>
