<script setup lang="ts">
import { cn } from '@/utils/cn';
import { PopoverContent, type PopoverContentProps, PopoverPortal } from 'radix-vue';

interface Props extends PopoverContentProps {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  sideOffset: 4
});
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="props"
      :class="
        cn(
          'z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2',
          props.class
        )
      "
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
