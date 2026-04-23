<script setup lang="ts">
import { cn } from '@/utils/cn';
import { ToastViewport, type ToastViewportProps } from 'radix-vue';

interface Props extends ToastViewportProps {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <ToastViewport
    v-bind="props"
    :class="
      cn(
        'fixed top-0 right-0 z-100 flex max-h-screen w-full flex-col p-4 md:max-w-[420px]',
        props.class
      )
    "
  />
</template>
