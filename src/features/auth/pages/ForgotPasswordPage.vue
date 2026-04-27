<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { CheckCircle2, ChevronLeft } from 'lucide-vue-next';
import { authMutations } from '../hooks/auth.mutations';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const router = useRouter();
const isSubmitted = ref(false);

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido')
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema)
});

const [email, emailProps] = defineField('email');

const requestResetMutation = authMutations.useRequestReset();

const onSubmit = handleSubmit((values) => {
  requestResetMutation.mutate(values.email, {
    onSuccess: () => {
      isSubmitted.value = true;
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
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          {{ isSubmitted ? 'E-mail Enviado' : 'Recuperar Senha' }}
        </h2>
        <p class="mt-2 text-sm text-gray-500">
          {{
            isSubmitted
              ? 'Verifique sua caixa de entrada para as instruções'
              : 'Digite seu e-mail para receber as instruções'
          }}
        </p>
      </div>

      <div v-if="isSubmitted" class="mt-8 space-y-6">
        <div class="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p class="text-sm text-green-700 leading-relaxed">
            Se o e-mail <strong>{{ email }}</strong> estiver cadastrado, você receberá um link para
            redefinir sua senha em instantes.
          </p>
        </div>
        <Button @click="router.push('/login')" variant="secondary" class="w-full">
          Voltar para o Login
        </Button>
      </div>

      <form v-else class="mt-8 space-y-6" @submit="onSubmit">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          v-model="email"
          v-bind="emailProps"
          :error="errors.email"
        />

        <div class="space-y-3">
          <Button
            type="submit"
            class="w-full h-11 text-base font-semibold"
            :is-loading="requestResetMutation.isPending.value"
          >
            Enviar Instruções
          </Button>
          <button
            type="button"
            @click="router.push('/login')"
            class="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft class="w-4 h-4 mr-1" />
            Voltar para o login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
