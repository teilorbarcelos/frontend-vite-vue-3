<script setup lang="ts" generic="T">
import { ref, computed } from 'vue';
import DataTable from './DataTable.vue';
import type { DataTableWithPaginationProps } from './types';

const props = withDefaults(defineProps<DataTableWithPaginationProps<T>>(), {
  pageSize: 10
});

const currentPage = ref(0);

const totalPages = computed((): number => Math.ceil(props.data.length / props.pageSize));

const safePage = computed((): number =>
  Math.min(currentPage.value, Math.max(0, totalPages.value - 1))
);

const paginatedData = computed((): T[] => {
  const start = safePage.value * props.pageSize;
  return props.data.slice(start, start + props.pageSize);
});

const handlePageChange = (page: number): void => {
  currentPage.value = page;
};
</script>

<template>
  <DataTable
    :data="paginatedData"
    :headerMap="props.headerMap"
    :totalItems="props.data.length"
    :class="props.class"
    :paginationProps="{
      currentPage: safePage,
      totalPages: totalPages,
      onPageChange: handlePageChange,
      pageSize: props.pageSize
    }"
  />
</template>
