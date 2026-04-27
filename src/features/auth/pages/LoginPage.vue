<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { CheckCircle2, Eye, EyeOff } from 'lucide-vue-next';
import { authMutations } from '../hooks/auth.mutations';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);

const loginSchema = z.object({
  email: z.string({ message: 'E-mail é obrigatório' }).email('E-mail inválido'),
  password: z.string({ message: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória')
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: ''
  }
});

const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');

const loginMutation = authMutations.useLogin();

const onSubmit = handleSubmit((values) => {
  loginMutation.mutate(values, {
    onSuccess: (res) => {
      authStore.login(res.token, res.refreshToken, res.user);
      router.push('/dashboard');
    }
  });
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300"
    >
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4"
        >
          <CheckCircle2 class="w-8 h-8 text-indigo-600" />
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Acesse sua conta</h2>
        <p class="mt-2 text-sm text-gray-500">Bem-vindo de volta ao Admin Panel</p>
      </div>

      <form class="mt-8 space-y-6" @submit="onSubmit">
        <div class="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            v-model="email"
            v-bind="emailProps"
            :error="errors.email"
          />
          <div class="space-y-1">
            <Input
              label="Senha"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              v-model="password"
              v-bind="passwordProps"
              :error="errors.password"
            >
              <template #right-element>
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="focus:outline-none"
                >
                  <EyeOff v-if="showPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </template>
            </Input>
            <div class="flex justify-end">
              <button
                type="button"
                @click="router.push('/forgot-password')"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          class="w-full h-11 text-base font-semibold"
          :is-loading="loginMutation.isPending.value"
        >
          Entrar
        </Button>
      </form>
    </div>
  </div>
</template>
