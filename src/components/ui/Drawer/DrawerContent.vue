<script setup lang="ts">
import { cn } from '@/utils/cn';
import { 
  DialogContent, 
  type DialogContentProps, 
  DialogPortal, 
  DialogOverlay,
  DialogClose
} from 'radix-vue';
import { X } from 'lucide-vue-next';

interface Props extends DialogContentProps {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      v-bind="props"
      :class="cn(
        'fixed inset-y-0 right-0 z-50 h-full w-full max-w-sm border-l bg-white p-0 shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 sm:max-w-md flex flex-col',
        props.class
      )"
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
        <X class="h-5 w-5 text-gray-500" />
        <span class="sr-only">Fechar</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
