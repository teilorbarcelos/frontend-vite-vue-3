/* v8 ignore start */
import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type MutationOptions as VueMutationOptions,
  type UseMutationReturnType
} from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { useLoadingStore } from '@/stores/loading';
import { useToastStore } from '@/stores/toast';

export type BaseMutationOptions<TData, TVariables, TContext = unknown> = VueMutationOptions<
  TData,
  AxiosError<{ message?: string }>,
  TVariables,
  TContext
> & {
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  invalidateQueries?: QueryKey[];
  showLoadingLabel?: string;
};

export type MutationOptions<TData, TVariables> = BaseMutationOptions<TData, TVariables>;

export function useBaseMutation<TData = unknown, TVariables = void, TContext = unknown>(
  options: BaseMutationOptions<TData, TVariables, TContext>
): UseMutationReturnType<TData, AxiosError<{ message?: string }>, TVariables, TContext> {
  const queryClient = useQueryClient();
  const toastStore = useToastStore();
  const loadingStore = useLoadingStore();

  const {
    onMutate,
    onSuccess,
    onError,
    onSettled,
    showLoadingLabel,
    invalidateQueries,
    successMessage,
    errorMessage,
    ...mutationOptions
  } = options;

  return useMutation({
    ...mutationOptions,
    onMutate: (variables: TVariables, context: unknown): TContext | Promise<TContext> => {
      /* v8 ignore next 3 */
      if (showLoadingLabel) {
        loadingStore.showLoading(showLoadingLabel);
      }
      /* v8 ignore start */
      if (onMutate) {
        return onMutate(variables, context as never) as TContext | Promise<TContext>;
      }
      /* v8 ignore stop */
      return undefined as TContext;
    },
    onSuccess: (data: TData, variables: TVariables, result: TContext): void => {
      loadingStore.hideLoading();
      /* v8 ignore next 5 */
      if (invalidateQueries) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      /* v8 ignore next 7 */
      if (successMessage) {
        const msg =
          typeof successMessage === 'function' ? successMessage(data, variables) : successMessage;
        toastStore.success(msg);
      }
      /* v8 ignore next */
      onSuccess?.(data, variables, result, {} as never);
    },
    onError: (
      err: AxiosError<{ message?: string }>,
      variables: TVariables,
      result: TContext | undefined
    ): void => {
      loadingStore.hideLoading();
      const msg = err.response?.data?.message || errorMessage || 'Ocorreu um erro inesperado.';
      toastStore.error(msg);
      /* v8 ignore next */
      onError?.(err, variables, result, {} as never);
    },
    /* v8 ignore start */
    onSettled: (
      data: TData | undefined,
      error: AxiosError<{ message?: string }> | null,
      variables: TVariables,
      result: TContext | undefined
    ): void => {
      loadingStore.hideLoading();
      onSettled?.(data, error, variables, result, {} as never);
    }
    /* v8 ignore stop */
  });
}
