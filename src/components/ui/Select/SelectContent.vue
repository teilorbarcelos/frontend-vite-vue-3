<script setup lang="ts">
// Componente auxiliar.
import { cn } from '@/utils/cn';
import {
  SelectContent,
  type SelectContentEmits,
  type SelectContentProps,
  SelectPortal,
  SelectViewport,
  SelectScrollUpButton,
  SelectScrollDownButton,
  useForwardPropsEmits
} from 'radix-vue';
import { ChevronUp, ChevronDown } from 'lucide-vue-next';

interface Props extends SelectContentProps {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'popper'
});
const emits = defineEmits<SelectContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwarded"
      @close-auto-focus.prevent
      :class="
        cn(
          'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class
        )
      "
    >
      <!-- v8 ignore next 3 -->
      <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
        <ChevronUp class="h-4 w-4" />
      </SelectScrollUpButton>

      <SelectViewport
        :class="
          cn(
            'p-1',
            position === 'popper' &&
              'h-(--radix-select-content-available-height) w-full min-w-(--radix-select-trigger-width)'
          )
        "
      >
        <slot />
      </SelectViewport>

      <!-- v8 ignore next 3 -->
      <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
        <ChevronDown class="h-4 w-4" />
      </SelectScrollDownButton>
    </SelectContent>
  </SelectPortal>
</template>
