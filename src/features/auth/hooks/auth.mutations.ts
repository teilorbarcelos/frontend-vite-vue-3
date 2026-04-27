import { useBaseMutation } from '@/hooks/useBaseMutation';
import {
  authService,
  type LoginPayload,
  type ResetPasswordPayload
} from '../services/auth.service';

export const authMutations = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useLogin: () =>
    useBaseMutation({
      mutationFn: (data: LoginPayload) => authService.login(data),
      successMessage: 'Bem-vindo de volta!',
      showLoadingLabel: 'Autenticando...'
    }),

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useRequestReset: () =>
    useBaseMutation({
      mutationFn: (email: string) => authService.requestPasswordReset(email),
      successMessage: 'Instruções enviadas para o seu e-mail!',
      showLoadingLabel: 'Enviando e-mail...'
    }),

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useResetPassword: () =>
    useBaseMutation({
      mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
      successMessage: 'Senha alterada com sucesso!',
      showLoadingLabel: 'Alterando senha...'
    })
};
