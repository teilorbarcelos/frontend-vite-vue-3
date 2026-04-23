<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { DataTable } from '@/components/ui/DataTable';
import ListPageHeader from '@/components/ui/ListPageHeader.vue';
import RoleFilters from '../components/RoleFilters.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useDataTable } from '@/hooks/useDataTable';
import { roleService } from '../services/role.service';
import { getRoleColumns } from '../constants/roleHeaderMap';
import { ROLE_SEARCHABLE_FIELDS as searchFields } from '../constants/role.constants';

const {
  page,
  size,
  searchWord,
  filters,
  sort,
  handleSearch,
  handleFilter,
  tableProps
} = useDataTable();

const isFilterOpen = ref(false);
const router = useRouter();
const queryClient = useQueryClient();
const authStore = useAuthStore();
const toastStore = useToastStore();

const permissions = computed(() => ({
  canCreate: authStore.hasPermission('role', 'create'),
  canUpdate: authStore.hasPermission('role', 'create'),
  canDelete: authStore.hasPermission('role', 'delete'),
}));

const { data, isError, isFetching } = useQuery({
  queryKey: computed(() => ['roles', page.value, size.value, searchWord.value, filters.value, sort.value]),
  queryFn: () => roleService.getRoles({
    page: page.value, 
    size: size.value, 
    searchWord: searchWord.value, 
    searchFields, 
    filters: filters.value,
    sort: sort.value,
    all: true
  }),
});

const toggleStatusMutation = useMutation({
  mutationFn: ({ id, active }: { id: string; active: boolean }) => roleService.toggleStatus(id, active),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    toastStore.success('Status da role atualizado!');
  },
  onError: (err: AxiosError<{ message?: string }>) => {
    toastStore.error(err.response?.data?.message || 'Erro ao atualizar status.');
  }
});

const deleteMutation = useMutation({
  mutationFn: (id: string) => roleService.deleteRole(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    toastStore.success('Role excluída com sucesso!');
  },
  onError: (err: AxiosError<{ message?: string }>) => {
    toastStore.error(err.response?.data?.message || 'Erro ao excluir role.');
  }
});

const columns = computed(() => getRoleColumns(
  (id, active) => toggleStatusMutation.mutate({ id, active }),
  (id) => router.push(`/roles/update/${id}`),
  (id) => deleteMutation.mutate(id),
  permissions.value
));
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <ListPageHeader
      title="Roles"
      @search="handleSearch"
      @filter-click="isFilterOpen = true"
      :filter-count="Object.keys(filters).length"
      :on-create-click="permissions.canCreate ? () => router.push('/roles/new') : undefined"
      create-label="Nova Role"
    />

    <RoleFilters
      :is-open="isFilterOpen"
      @close="isFilterOpen = false"
      @filter="handleFilter"
      :initial-values="filters"
    />

    <div v-if="isError" class="p-8 text-center text-red-500">Erro ao carregar roles</div>

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
