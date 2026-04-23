<script setup lang="ts">
import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useAuthStore } from '@/stores/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');

const router = useRouter();
const authStore = useAuthStore();

const loginMutation = useMutation({
  mutationFn: async (data: any) => {
    const response = await api.post('/v1/auth/login', data);
    return response.data;
  },
  onSuccess: (data) => {
    authStore.login(data.token, data.refreshToken, data.user);
    router.push('/dashboard');
  },
});

const onSubmit = handleSubmit((values) => {
  loginMutation.mutate(values);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit="onSubmit">
        <div class="space-y-4">
          <div>
            <label htmlFor="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              v-model="email"
              v-bind="emailProps"
              id="email"
              type="email"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                errors.email ? 'border-red-300' : 'border-gray-300'
              ]"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          <div>
            <label htmlFor="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              v-model="password"
              v-bind="passwordProps"
              id="password"
              type="password"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                errors.password ? 'border-red-300' : 'border-gray-300'
              ]"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
        </div>

        <div v-if="loginMutation.isError.value" class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200 font-medium">
          {{ axios.isAxiosError(loginMutation.error.value) && (loginMutation.error.value.code === 'ERR_NETWORK' || !loginMutation.error.value.response)
            ? 'O servidor está offline. Tente novamente mais tarde.'
            : 'Usuário ou senha incorretos. Verifique seus dados.' }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loginMutation.isPending.value"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loginMutation.isPending.value ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
