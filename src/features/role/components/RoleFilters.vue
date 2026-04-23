<script setup lang="ts">
import FilterDrawer, { type FilterField } from '@/components/ui/FilterDrawer.vue';

interface Props {
  isOpen: boolean;
  initialValues?: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'filter']);

const ROLE_FILTER_CONFIG: FilterField[] = [
  { 
    name: 'active', 
    label: 'Status', 
    type: 'select', 
    options: [
      { label: 'Ativo', value: 'true' },
      { label: 'Inativo', value: 'false' }
    ] 
  },
  { name: 'createdAt', label: 'Data de Criação', type: 'dateRange' }
];
</script>

<template>
  <FilterDrawer
    :is-open="isOpen"
    :fields="ROLE_FILTER_CONFIG"
    :initial-values="initialValues"
    @close="emit('close')"
    @filter="emit('filter', $event)"
  />
</template>
