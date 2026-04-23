<script setup lang="ts">
import { cn } from '@/utils/cn';
import { DropdownMenuContent, type DropdownMenuContentProps, DropdownMenuPortal } from 'radix-vue';

interface Props extends DropdownMenuContentProps {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sideOffset: 4,
});
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="props"
      :class="cn(
        'z-50 min-w-32 overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.class
      )"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
