<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { DataTable } from '@/components/ui/DataTable';
import ListPageHeader from '@/components/ui/ListPageHeader.vue';
import ProductFilters from '../components/ProductFilters.vue';
import { useAuthStore } from '@/stores/auth';
import { useDataTable } from '@/hooks/useDataTable';
import { productService } from '../services/product.service';
import { getProductColumns } from '../constants/productHeaderMap';
import { PRODUCT_SEARCHABLE_FIELDS as searchFields } from '../constants/product.constants';
import { productMutations } from '../hooks/product.mutations';

const { page, size, searchWord, filters, sort, handleSearch, handleFilter, tableProps } =
  useDataTable();

const isFilterOpen = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const permissions = computed(() => ({
  canCreate: authStore.hasPermission('product', 'create'),
  canUpdate: authStore.hasPermission('product', 'create'),
  canDelete: authStore.hasPermission('product', 'delete')
}));

const { data, isError, isFetching } = useQuery({
  queryKey: computed(() => [
    'products',
    page.value,
    size.value,
    searchWord.value,
    filters.value,
    sort.value
  ]),
  queryFn: () =>
    productService.getProducts({
      page: page.value,
      size: size.value,
      searchWord: searchWord.value,
      searchFields,
      filters: filters.value,
      sort: sort.value,
      all: true
    })
});

const toggleStatusMutation = productMutations.useToggleStatus();
const deleteMutation = productMutations.useDelete();

const columns = computed(() =>
  getProductColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => router.push(`/products/update/${id}`),
    (id) => deleteMutation.mutate(id),
    permissions.value
  )
);
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <ListPageHeader
      title="Produtos"
      @search="handleSearch"
      @filter-click="isFilterOpen = true"
      :filter-count="Object.keys(filters).length"
      :on-create-click="permissions.canCreate ? () => router.push('/products/new') : undefined"
      create-label="Novo Produto"
    />

    <ProductFilters
      :is-open="isFilterOpen"
      @close="isFilterOpen = false"
      @filter="handleFilter"
      :initial-values="filters"
    />

    <div v-if="isError" class="p-8 text-center text-red-500">Erro ao carregar produtos</div>

    <DataTable
      v-else
      v-bind="tableProps"
      :data="data?.items || []"
      :header-map="columns"
      :is-loading="isFetching"
      :total-items="data?.total || 0"
    />
  </div>
</template>
