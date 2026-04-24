<script setup lang="ts">
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next';
import type { ToastVariant } from './ToastRoot.vue';

interface Props {
  variant?: ToastVariant;
}

defineProps<Props>();
</script>

<template>
  <CheckCircle2
    v-if="variant === 'success'"
    data-testid="success-icon"
    class="h-5 w-5 text-green-500"
  />
  <AlertCircle
    v-else-if="variant === 'error'"
    data-testid="error-icon"
    class="h-5 w-5 text-red-500"
  />
  <AlertTriangle
    v-else-if="variant === 'warning'"
    data-testid="warning-icon"
    class="h-5 w-5 text-yellow-500"
  />
  <Info v-else-if="variant === 'info'" data-testid="info-icon" class="h-5 w-5 text-blue-500" />
</template>
