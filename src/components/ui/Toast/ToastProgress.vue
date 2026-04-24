<script setup lang="ts">
import { cn } from '@/utils/cn';
import type { ToastVariant } from './ToastRoot.vue';

interface Props {
  duration?: number;
  variant?: ToastVariant;
}

defineProps<Props>();
</script>

<template>
  <div v-if="duration" class="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
    <div
      :class="
        cn('h-full transition-all ease-linear animate-toast-progress', {
          'bg-gray-500': !variant || variant === 'default',
          'bg-green-500': variant === 'success',
          'bg-red-500': variant === 'error',
          'bg-yellow-500': variant === 'warning',
          'bg-blue-500': variant === 'info'
        })
      "
      :style="{
        '--toast-duration': `${duration}ms`
      }"
    />
  </div>
</template>

<style scoped>
.animate-toast-progress {
  animation: toast-progress var(--toast-duration) linear forwards;
}

.group:hover .animate-toast-progress {
  animation-play-state: paused;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
