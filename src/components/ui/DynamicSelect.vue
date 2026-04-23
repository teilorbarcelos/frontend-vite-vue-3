<script setup lang="ts" generic="T extends { id: string | number }">
import { ref, computed, watch, onUnmounted, useId } from 'vue';
import { Check, ChevronDown, Search, X } from 'lucide-vue-next';
import { useMageSelect } from '@/composables/useMageSelect';
import Button from './Button.vue';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { cn } from '@/utils/cn';

interface Props {
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  modelValue?: string | string[];
  fetchPage: (page: number, search: string, options: { searchFields?: string[]; signal?: AbortSignal }) => Promise<{ items: T[]; hasMore: boolean }>;
  fetchByIds: (ids: string[]) => Promise<T[]>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string;
  startPage?: number;
  searchFields?: string[];
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecione...",
  multiple: false,
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);

const {
  state,
  engine,
} = useMageSelect<T>({
  fetchPage: props.fetchPage,
  fetchByIds: props.fetchByIds,
  getId: props.getOptionValue,
  startPage: props.startPage,
  searchFields: props.searchFields,
});

// Watch modelValue to update engine
watch(() => props.modelValue, (newVal) => {
  const ids = Array.isArray(newVal) ? newVal : newVal ? [newVal] : [];
  engine.setValue(ids);
}, { immediate: true, deep: true });

const observerTarget = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  observer?.disconnect();
  if (observerTarget.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.value.hasMore && !state.value.isLoading) {
          engine.loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerTarget.value);
  }
};

watch(observerTarget, () => {
  setupObserver();
});

const handleSelect = (item: any) => {
  const typedItem = item as T;
  if (props.multiple) {
    engine.toggleSelection(typedItem);
    // Use nextTick or wait for state update
    setTimeout(() => {
      const currentSelected = engine.getState().selectedItems;
      emit('update:modelValue', currentSelected.map(props.getOptionValue));
    }, 0);
  } else {
    engine.setValue([props.getOptionValue(typedItem)]);
    emit('update:modelValue', props.getOptionValue(typedItem));
    open.value = false;
  }
};

const handleRemove = (item: any) => {
  engine.toggleSelection(item as T);
  setTimeout(() => {
    const currentSelected = engine.getState().selectedItems;
    emit('update:modelValue', currentSelected.map(props.getOptionValue));
  }, 0);
};

const handleOpenChange = (isOpen: boolean) => {
  open.value = isOpen;
  if (isOpen && !state.value.initialized && !state.value.isLoading) {
    engine.initialLoad();
  }
};

const displayValue = computed(() => {
  if (props.multiple) return props.placeholder;
  return state.value.selectedItems[0] ? props.getOptionLabel(state.value.selectedItems[0] as T) : props.placeholder;
});

const labelId = useId();

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" :id="labelId" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    
    <Popover :open="open" @update:open="handleOpenChange">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          :aria-labelledby="label ? labelId : undefined"
          :class="cn(
            'w-full justify-between font-normal bg-white h-10 px-3 py-2 border-gray-300',
            !state.selectedItems.length && 'text-gray-400',
            error && 'border-red-500',
            'hover:bg-gray-50 transition-colors'
          )"
        >
          <span class="truncate">{{ displayValue }}</span>
          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[--radix-popover-trigger-width] p-0" align="start">
        <div class="flex flex-col max-h-[300px] bg-white rounded-md shadow-lg border border-gray-200">
          <div class="flex items-center border-b px-3 sticky top-0 bg-white z-10">
            <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Pesquisar..."
              :value="state.search"
              @input="engine.setSearch(($event.target as HTMLInputElement).value)"
            />
          </div>
          
          <div class="overflow-y-auto flex-1 py-1">
            <div v-if="state.items.length === 0 && !state.isLoading" class="py-6 text-center text-sm text-gray-500">
              Nenhum resultado encontrado.
            </div>
            
            <div
              v-for="item in state.items"
              :key="getOptionValue(item as T)"
              :class="cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors',
                state.selectedItems.some(s => getOptionValue(s as T) === getOptionValue(item as T)) ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-gray-100 text-gray-700'
              )"
              @click="handleSelect(item)"
            >
              <div class="flex-1 truncate">
                {{ getOptionLabel(item as T) }}
              </div>
              <Check v-if="state.selectedItems.some(s => getOptionValue(s as T) === getOptionValue(item as T))" class="ml-2 h-4 w-4 text-indigo-600" />
            </div>
            
            <div v-if="state.isLoading" class="py-3 text-center flex items-center justify-center gap-2">
              <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <span class="text-sm text-gray-500">Carregando...</span>
            </div>
            <div ref="observerTarget" class="h-4 w-full" />
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <div v-if="multiple && state.selectedItems.length > 0" class="flex flex-wrap gap-2 mt-2">
      <div
        v-for="item in state.selectedItems"
        :key="getOptionValue(item as T)"
        class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
      >
        {{ getOptionLabel(item as T) }}
        <button
          type="button"
          aria-label="Remove"
          @click.stop="handleRemove(item)"
          class="hover:text-indigo-900 transition-colors p-0.5 rounded-full hover:bg-indigo-100"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>
    
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>
