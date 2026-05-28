<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import DynamicSelect from '@/components/ui/DynamicSelect.vue';
import { roleService } from '@/features/role/services/role.service';
import { useToastStore } from '@/stores/toast';
import { userService } from '../services/user.service';
import { userMutations } from '../hooks/user.mutations';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  id_role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  document: z.string().optional()
});

type UserForm = z.infer<typeof userSchema>;

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;
const isEditing = computed(() => Boolean(id && id !== 'new'));
const toastStore = useToastStore();

const { data: user, isLoading: isLoadingUser } = useQuery({
  queryKey: computed(() => ['user', id]),
  queryFn: () => userService.getUser(id),
  enabled: isEditing
});

const { handleSubmit, resetForm, defineField, errors } = useForm<UserForm>({
  validationSchema: toTypedSchema(userSchema),
  initialValues: {
    name: '',
    email: '',
    id_role: '',
    phone: '',
    document: '',
    password: ''
  }
});

const [name, nameProps] = defineField('name');
const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');
const [id_role, id_roleProps] = defineField('id_role');
const [phone, phoneProps] = defineField('phone');
const [document, documentProps] = defineField('document');

watch(
  user,
  (newUser) => {
    if (newUser) {
      resetForm({
        values: {
          name: newUser.name,
          email: newUser.email,
          id_role: newUser.id_role,
          phone: newUser.phone || '',
          document: newUser.document || '',
          password: ''
        }
      });
    }
  },
  { immediate: true }
);

const mutation = userMutations.useSave(isEditing.value, id, {
  mutationFn: (data: UserForm) => {
    const payload = { ...data };
    if (!payload.password) {
      delete payload.password;
    }

    if (isEditing.value) {
      return userService.updateUser(id, payload);
    }
    return userService.createUser(payload);
  },
  onSuccess: () => {
    router.push('/users');
  }
});

const onSubmit = handleSubmit((data) => {
  if (!isEditing.value && !data.password) {
    toastStore.error('Senha é obrigatória para novos usuários');
    return;
  }
  mutation.mutate(data);
});
</script>

<template>
  <div v-if="isEditing && isLoadingUser" class="p-8 text-center text-gray-500">
    Loading user data...
  </div>

  <div v-else class="overflow-y-auto flex-1 pb-8">
    <div
      class="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Edit User' : 'New User' }}
        </h1>
        <Button variant="ghost" @click="router.push('/users')"> Cancel </Button>
      </div>

      <form @submit="onSubmit" class="space-y-4">
        <Input
          label="Name"
          v-bind="nameProps"
          v-model="name"
          :error="errors.name"
          placeholder="Full Name"
        />

        <Input
          label="Email"
          type="email"
          v-bind="emailProps"
          v-model="email"
          :error="errors.email"
          placeholder="user@example.com"
        />

        <Input
          label="Password"
          type="password"
          v-bind="passwordProps"
          v-model="password"
          :error="errors.password"
          :placeholder="isEditing ? 'Leave blank to keep unchanged' : 'Password'"
        />

        <DynamicSelect
          label="Perfil"
          placeholder="Select a role"
          v-bind="id_roleProps"
          v-model="id_role"
          :start-page="0"
          :search-fields="['name']"
          :fetch-page="roleService.mageSelect"
          :fetch-by-ids="roleService.mageHydrate"
          :get-option-label="(role: any) => role.name"
          :get-option-value="(role: any) => role.id"
          :error="errors.id_role"
        />

        <Input
          label="Phone"
          v-bind="phoneProps"
          v-model="phone"
          :error="errors.phone"
          placeholder="+55 11 99999-9999"
        />

        <Input
          label="Document (CPF/CNPJ)"
          v-bind="documentProps"
          v-model="document"
          :error="errors.document"
          placeholder="000.000.000-00"
        />

        <div class="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="router.push('/users')"> Cancel </Button>
          <Button type="submit" :disabled="mutation.isPending.value">
            {{ mutation.isPending.value ? 'Saving...' : 'Save User' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
