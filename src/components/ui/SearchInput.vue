<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';
import Input from './Input.vue';

interface Props {
  placeholder?: string;
  defaultValue?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pesquisar...',
  defaultValue: ''
});

const emit = defineEmits(['search']);

const value = ref(props.defaultValue);
let timeout: ReturnType<typeof setTimeout> | null = null;

const debouncedSearch = (val: string): void => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    emit('search', val);
  }, 500);
};

watch(value, (newVal) => {
  debouncedSearch(newVal);
});

const handleClear = (): void => {
  value.value = '';
  if (timeout) clearTimeout(timeout);
  emit('search', '');
};
</script>

<template>
  <div :class="props.class">
    <div class="relative group">
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10"
      >
        <Search class="h-4 w-4" />
      </div>
      <Input type="text" v-model="value" :placeholder="placeholder" class="pl-10 pr-10" />
      <button
        v-if="value"
        type="button"
        @click="handleClear"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
