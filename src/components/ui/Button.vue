<script setup lang="ts">
import { cn } from '@/utils/cn';
import { buttonVariants, type ButtonVariantProps } from './button-variants';
import { Loader2 } from 'lucide-vue-next';

interface Props extends /* @vue-ignore */ ButtonVariantProps {
  class?: string;
  variant?: ButtonVariantProps['variant'];
  size?: ButtonVariantProps['size'];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  isLoading: false
});
</script>

<template>
  <button
    v-bind="$attrs"
    :disabled="isLoading || ($attrs.disabled as boolean)"
    :class="
      cn(buttonVariants({ variant: props.variant, size: props.size, className: props.class }))
    "
  >
    <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin inline-block" />
    <slot />
  </button>
</template>
