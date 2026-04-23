<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { useLoadingStore } from '@/stores/loading';
import { useToastStore } from '@/stores/toast';
import { roleService, type RoleFeature } from '../services/role.service';

const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  permissions: z.array(z.object({
    id_feature: z.string(),
    create: z.boolean(),
    view: z.boolean(),
    delete: z.boolean(),
    activate: z.boolean(),
  })),
});

type RoleForm = z.infer<typeof roleSchema>;

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const id = route.params.id as string;
const isEditing = computed(() => Boolean(id && id !== 'new'));
const toastStore = useToastStore();
const loadingStore = useLoadingStore();

const { data: features, isLoading: isLoadingFeatures } = useQuery({
  queryKey: ['features'],
  queryFn: () => roleService.getFeatures(),
});

const { data: role, isLoading: isLoadingRole } = useQuery({
  queryKey: computed(() => ['role', id]),
  queryFn: () => roleService.getRole(id),
  enabled: isEditing,
});

const { handleSubmit, resetForm, defineField, values, errors } = useForm<RoleForm>({
  validationSchema: toTypedSchema(roleSchema),
  initialValues: {
    name: '',
    description: '',
    permissions: [],
  },
});

const [name, nameProps] = defineField('name');
const [description, descriptionProps] = defineField('description');
const { fields } = useFieldArray('permissions');

watch([features, role], ([newFeatures, newRole]) => {
  if (!newFeatures) return;
  
  const initialPermissions = newFeatures.map(feature => {
    const existing = newRole?.RoleFeature?.find((rf: RoleFeature) => rf.id_feature === feature.id);
    return {
      id_feature: feature.id,
      create: existing?.create ?? false,
      view: existing?.view ?? false,
      delete: existing?.delete ?? false,
      activate: existing?.activate ?? false,
    };
  });

  resetForm({
    values: {
      name: newRole?.name || '',
      description: newRole?.description || '',
      permissions: initialPermissions,
    }
  });
}, { immediate: true });

const mutation = useMutation({
  mutationFn: (data: RoleForm) => {
    loadingStore.showLoading('Salvando perfil...');
    if (isEditing.value) {
      return roleService.updateRole(id, data);
    }
    return roleService.createRole(data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    loadingStore.hideLoading();
    toastStore.success(isEditing.value ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');
    router.push('/roles');
  },
  onError: (err: AxiosError<{ message?: string }>) => {
    loadingStore.hideLoading();
    toastStore.error(err.response?.data?.message || 'Erro ao salvar perfil. Tente novamente.');
  }
});

const onSubmit = handleSubmit((data) => {
  mutation.mutate(data);
});
</script>

<template>
  <div v-if="(isEditing && isLoadingRole) || isLoadingFeatures" class="p-8 text-center text-gray-500">
    Carregando dados...
  </div>
  
  <div v-else class="overflow-y-auto flex-1 pb-8">
    <div class="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Perfil' : 'Novo Perfil' }}
        </h1>
        <Button variant="ghost" @click="router.push('/roles')">
          Cancelar
        </Button>
      </div>

      <form @submit="onSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Perfil"
            v-bind="nameProps"
            v-model="name"
            :error="errors.name"
            placeholder="Ex: Administrador"
          />
          
          <Input
            label="Descrição"
            v-bind="descriptionProps"
            v-model="description"
            :error="errors.description"
            placeholder="Descrição das responsabilidades"
          />
        </div>

        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Matriz de Permissões</h2>
          <div class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ver</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Criar/Editar</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deletar</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ativar/Inativar</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(field, index) in fields" :key="field.key" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ features?.find(f => f.id === values.permissions[index].id_feature)?.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ features?.find(f => f.id === values.permissions[index].id_feature)?.description }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      v-model="values.permissions[index].view"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      v-model="values.permissions[index].create"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      v-model="values.permissions[index].delete"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      v-model="values.permissions[index].activate"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="router.push('/roles')">
            Cancelar
          </Button>
          <Button type="submit" :disabled="mutation.isPending.value">
            {{ mutation.isPending.value ? 'Salvando...' : 'Salvar Perfil' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
