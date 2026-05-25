<script setup lang="ts">
import { Plus, Filter } from 'lucide-vue-next';
import Button from './Button.vue';
import SearchInput from './SearchInput.vue';

interface Props {
  title: string;
  filterCount: number;
  onCreateClick?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  createLabel: 'Novo'
});

const emit = defineEmits(['search', 'filter-click']);
</script>

<template>
  <div class="flex items-center justify-between mb-6 shrink-0">
    <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
    <div class="flex items-center space-x-4">
      <SearchInput @search="emit('search', $event)" class="w-80" :placeholder="searchPlaceholder" />
      <Button
        variant="secondary"
        @click="emit('filter-click')"
        :class="filterCount > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''"
      >
        <Filter class="w-4 h-4 mr-2" />
        Filtros
        <span
          v-if="filterCount > 0"
          class="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full"
        >
          {{ filterCount }}
        </span>
      </Button>
      <slot name="extra-actions" />
      <Button v-if="onCreateClick" @click="onCreateClick">
        <Plus class="w-4 h-4 mr-2" />
        {{ createLabel }}
      </Button>
    </div>
  </div>
</template>
