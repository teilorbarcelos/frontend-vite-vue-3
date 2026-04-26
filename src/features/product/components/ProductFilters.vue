<script setup lang="ts">
import FilterDrawer from '@/components/ui/FilterDrawer.vue';
import { PRODUCT_FILTER_CONFIG } from '../constants/product.constants';

interface Props {
  isOpen: boolean;
  initialValues?: Record<string, unknown>;
}

defineProps<Props>();
const emit = defineEmits(['close', 'filter']);
</script>

<template>
  <FilterDrawer
    :is-open="isOpen"
    :fields="PRODUCT_FILTER_CONFIG"
    :initial-values="initialValues"
    @close="emit('close')"
    @filter="emit('filter', $event)"
  />
</template>
