<script setup lang="ts">
import { cn } from '@/utils/cn';
import { SelectTrigger, type SelectTriggerProps, SelectIcon } from 'radix-vue';
import { ChevronDown } from 'lucide-vue-next';

interface Props extends SelectTriggerProps {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <SelectTrigger
    v-bind="props"
    :class="
      cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
