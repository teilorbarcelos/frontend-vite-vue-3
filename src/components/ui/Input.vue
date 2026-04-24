<script setup lang="ts">
import { useId } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  modelValue?: string | number;
  label?: string;
  error?: string;
  class?: string;
  id?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const generatedId = useId();
const inputId = props.id || generatedId;

defineOptions({
  inheritAttrs: false
});
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-bind="$attrs"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="
        cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-red-500 focus:ring-red-500': error
          },
          props.class
        )
      "
    />
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
