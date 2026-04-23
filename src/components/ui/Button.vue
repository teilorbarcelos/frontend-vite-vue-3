<script setup lang="ts">
import { cn } from '@/utils/cn';
import { buttonVariants, type ButtonVariantProps } from './button-variants';

interface Props extends /* @vue-ignore */ ButtonVariantProps {
  class?: string;
  variant?: ButtonVariantProps['variant'];
  size?: ButtonVariantProps['size'];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});
</script>

<template>
  <button
    v-bind="$attrs"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size, className: props.class }))"
  >
    <slot />
  </button>
</template>
