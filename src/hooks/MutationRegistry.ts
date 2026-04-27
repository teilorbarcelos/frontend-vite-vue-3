import type { UseMutationReturnType } from '@tanstack/vue-query';

import type { AxiosError } from 'axios';
import { useBaseMutation, type MutationOptions } from './useBaseMutation';

export interface MutationRegistryConfig {
  queryKey: string;
  service: Record<string, (...args: unknown[]) => Promise<unknown>>;
  name: string;
  capitalizeName?: string;
  messages?: {
    saveSuccess?: (isEditing: boolean) => string;
    deleteSuccess?: string;
    toggleStatusSuccess?: string;
    saveError?: string;
    deleteError?: string;
    toggleStatusError?: string;
    loadingLabel?: string;
  };
}

export type RegistryReturnType<TEntity> = {
  useSave: <TForm = unknown>(
    isEditing: boolean,
    id?: string,
    options?: MutationOptions<TEntity, TForm>
  ) => UseMutationReturnType<TEntity, AxiosError<{ message?: string }>, TForm, unknown>;
  useDelete: (
    options?: MutationOptions<void, string>
  ) => UseMutationReturnType<void, AxiosError<{ message?: string }>, string, unknown>;
  useToggleStatus: (
    options?: MutationOptions<void, { id: string; active: boolean }>
  ) => UseMutationReturnType<
    void,
    AxiosError<{ message?: string }>,
    { id: string; active: boolean },
    unknown
  >;
};

export function createMutationRegistry<TEntity = unknown>(
  config: MutationRegistryConfig
): RegistryReturnType<TEntity> {
  const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
  const capitalizeName = config.capitalizeName || capitalize(config.name);
  const messages = config.messages;

  return {
    useSave: <TForm = unknown>(
      isEditing: boolean,
      id?: string,
      options?: MutationOptions<TEntity, TForm>
    ): UseMutationReturnType<TEntity, AxiosError<{ message?: string }>, TForm, unknown> => {
      return useBaseMutation<TEntity, TForm>({
        mutationFn: (data: TForm) => {
          const method = isEditing ? `update${capitalizeName}` : `create${capitalizeName}`;
          const fn = config.service[method] as unknown as (...args: unknown[]) => Promise<TEntity>;
          return isEditing ? fn(id, data) : fn(data);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.saveError,
        showLoadingLabel: messages?.loadingLabel || 'Salvando...',
        successMessage:
          options?.successMessage ||
          messages?.saveSuccess?.(isEditing) ||
          (isEditing
            ? `${capitalizeName} atualizado com sucesso!`
            : `${capitalizeName} criado com sucesso!`),
        ...options
      } as MutationOptions<TEntity, TForm>);
    },

    useDelete: (
      options?: MutationOptions<void, string>
    ): UseMutationReturnType<void, AxiosError<{ message?: string }>, string, unknown> => {
      return useBaseMutation<void, string>({
        mutationFn: (id: string) => {
          const fn = config.service[`delete${capitalizeName}`] as unknown as (
            id: string
          ) => Promise<void>;
          return fn(id);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.deleteError,
        successMessage:
          options?.successMessage ||
          messages?.deleteSuccess ||
          `${capitalizeName} excluído com sucesso!`,
        ...options
      } as MutationOptions<void, string>);
    },

    useToggleStatus: (
      options?: MutationOptions<void, { id: string; active: boolean }>
    ): UseMutationReturnType<
      void,
      AxiosError<{ message?: string }>,
      { id: string; active: boolean },
      unknown
    > => {
      return useBaseMutation<void, { id: string; active: boolean }>({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => {
          const fn = config.service.toggleStatus as unknown as (
            id: string,
            active: boolean
          ) => Promise<void>;
          return fn(id, active);
        },
        invalidateQueries: [[config.queryKey]],
        errorMessage: messages?.toggleStatusError,
        successMessage:
          options?.successMessage || messages?.toggleStatusSuccess || 'Status atualizado!',
        ...options
      } as MutationOptions<void, { id: string; active: boolean }>);
    }
  };
}
