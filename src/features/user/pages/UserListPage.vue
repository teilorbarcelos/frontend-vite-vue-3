<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { DataTable } from '@/components/ui/DataTable';
import ListPageHeader from '@/components/ui/ListPageHeader.vue';
import UserFilters from '../components/UserFilters.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useDataTable } from '@/hooks/useDataTable';
import { userService } from '../services/user.service';
import { getUserColumns } from '../constants/userHeaderMap';
import { USER_SEARCHABLE_FIELDS as searchFields } from '../constants/user.constants';

const { page, size, searchWord, filters, sort, handleSearch, handleFilter, tableProps } =
  useDataTable();

const isFilterOpen = ref(false);
const router = useRouter();
const queryClient = useQueryClient();
const authStore = useAuthStore();
const toastStore = useToastStore();

const permissions = computed(() => ({
  canCreate: authStore.hasPermission('user', 'create'),
  canUpdate: authStore.hasPermission('user', 'create'),
  canDelete: authStore.hasPermission('user', 'delete')
}));

const { data, isError, isFetching } = useQuery({
  queryKey: computed(() => [
    'users',
    page.value,
    size.value,
    searchWord.value,
    filters.value,
    sort.value
  ]),
  queryFn: () =>
    userService.getUsers({
      page: page.value,
      size: size.value,
      searchWord: searchWord.value,
      searchFields,
      filters: filters.value,
      sort: sort.value,
      all: true
    })
});

const toggleStatusMutation = useMutation({
  mutationFn: ({ id, active }: { id: string; active: boolean }) =>
    userService.toggleStatus(id, active),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toastStore.success('Status do usuário atualizado!');
  },
  onError: (err: AxiosError<{ message?: string }>) => {
    toastStore.error(err.response?.data?.message || 'Erro ao atualizar status.');
  }
});

const deleteMutation = useMutation({
  mutationFn: (id: string) => userService.deleteUser(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toastStore.success('Usuário excluído com sucesso!');
  },
  onError: (err: AxiosError<{ message?: string }>) => {
    toastStore.error(err.response?.data?.message || 'Erro ao excluir usuário.');
  }
});

const columns = computed(() =>
  getUserColumns(
    (id, active) => toggleStatusMutation.mutate({ id, active }),
    (id) => router.push(`/users/update/${id}`),
    (id) => deleteMutation.mutate(id),
    permissions.value
  )
);
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <ListPageHeader
      title="Usuários"
      @search="handleSearch"
      @filter-click="isFilterOpen = true"
      :filter-count="Object.keys(filters).length"
      :on-create-click="permissions.canCreate ? () => router.push('/users/new') : undefined"
      create-label="Novo Usuário"
    />

    <UserFilters
      :is-open="isFilterOpen"
      @close="isFilterOpen = false"
      @filter="handleFilter"
      :initial-values="filters"
    />

    <div v-if="isError" class="p-8 text-center text-red-500">Erro ao carregar usuários</div>

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
