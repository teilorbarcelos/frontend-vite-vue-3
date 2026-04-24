<script setup lang="ts">
import { cn } from '@/utils/cn';
import { DropdownMenuItem, type DropdownMenuItemProps } from 'radix-vue';

interface Props extends DropdownMenuItemProps {
  class?: string;
  inset?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuItem
    v-bind="props"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-disabled:pointer-events-none data-disabled:opacity-50',
        inset && 'pl-8',
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
