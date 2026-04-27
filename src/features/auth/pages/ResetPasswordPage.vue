<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/vue-query';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-vue-next';
import { authService } from '../services/auth.service';
import { authMutations } from '../hooks/auth.mutations';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const route = useRoute();
const router = useRouter();
const email = computed(() => route.query.email as string);
const token = computed(() => route.query.token as string);

const isSuccess = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema)
});

const [password, passwordProps] = defineField('password');
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword');

const { data: validationData, isLoading: isValidating } = useQuery({
  queryKey: ['validate-token', computed(() => email.value), computed(() => token.value)],

  queryFn: async () => {
    try {
      return await authService.validateResetToken(email.value, token.value);
    } catch (e) {
      console.error('Validation error:', e);
      return { valid: false };
    }
  },
  enabled: computed(() => !!email.value && !!token.value),
  retry: false
});

const isTokenValid = computed(() => validationData.value?.valid || false);

const resetMutation = authMutations.useResetPassword();

const onSubmit = handleSubmit((values) => {
  resetMutation.mutate(
    {
      email: email.value,
      token: token.value,
      password: values.password
    },
    {
      onSuccess: () => {
        isSuccess.value = true;
        setTimeout(() => router.push('/login'), 3000);
      }
    }
  );
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="isValidating" class="animate-pulse flex flex-col items-center">
      <div class="w-12 h-12 bg-indigo-200 rounded-full mb-4"></div>
      <div class="h-4 w-48 bg-gray-200 rounded"></div>
    </div>

    <div
      v-else-if="isSuccess"
      class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center"
    >
      <CheckCircle2 class="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-gray-900">Senha Alterada!</h2>
      <p class="mt-2 text-gray-600">
        Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.
      </p>
      <Button @click="router.push('/login')" variant="secondary" class="mt-6 w-full">
        Ir para Login Agora
      </Button>
    </div>

    <div
      v-else
      class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4"
        >
          <CheckCircle2 class="w-8 h-8 text-indigo-600" />
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          {{ isTokenValid ? 'Nova Senha' : 'Link Inválido' }}
        </h2>
        <p class="mt-2 text-sm text-gray-500">
          {{
            isTokenValid
              ? `Defina sua nova senha de acesso para ${email}`
              : 'O link de recuperação não é mais válido'
          }}
        </p>
      </div>

      <div v-if="!isTokenValid" class="mt-8 space-y-6">
        <div class="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-700 leading-relaxed">
            Este link de recuperação expirou ou já foi utilizado. Por segurança, os links de
            recuperação têm validade curta.
          </p>
        </div>
        <Button @click="router.push('/login')" class="w-full"> Voltar para o Login </Button>
      </div>

      <form v-else class="mt-8 space-y-6" @submit="onSubmit">
        <div class="space-y-4">
          <Input
            label="Nova Senha"
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

          <Input
            label="Confirmar Nova Senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            v-model="confirmPassword"
            v-bind="confirmPasswordProps"
            :error="errors.confirmPassword"
          >
            <template #right-element>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="focus:outline-none"
              >
                <EyeOff v-if="showConfirmPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </template>
          </Input>
        </div>

        <Button
          type="submit"
          class="w-full h-11 text-base font-semibold"
          :is-loading="resetMutation.isPending.value"
        >
          Redefinir Senha
        </Button>
      </form>
    </div>
  </div>
</template>
