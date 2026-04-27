import { createMutationRegistry } from '@/hooks/MutationRegistry';
import { roleService, type Role } from '../services/role.service';

export const roleMutations = createMutationRegistry<Role>({
  queryKey: 'roles',
  service: roleService as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>,
  name: 'role',
  capitalizeName: 'Role',
  messages: {
    saveSuccess: (isEditing) =>
      isEditing ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!',
    saveError: 'Erro ao salvar perfil. Tente novamente.',
    deleteSuccess: 'Perfil excluído com sucesso!',
    deleteError: 'Erro ao excluir perfil.',
    toggleStatusSuccess: 'Status do perfil atualizado!',
    toggleStatusError: 'Erro ao atualizar status.',
    loadingLabel: 'Salvando perfil...'
  }
});
