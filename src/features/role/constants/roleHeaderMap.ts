import { DataTableActions, type HeaderMapItem } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import type { Role } from '../services/role.service';
import { h } from 'vue';

export const getRoleColumns = (
  onToggleStatus: (id: string, active: boolean) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  }
): HeaderMapItem<Role>[] => [
  { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
  { title: 'Descrição', keyItem: 'description', truncate: true, sortable: true },
  {
    title: 'Status',
    keyItem: 'active',
    sortable: true,
    parseItem: (active, role) =>
      h(StatusBadge, {
        active: !!active,
        feature: 'role',
        onClick: () => onToggleStatus(role.id, !role.active)
      })
  },
  {
    title: '',
    keyItem: 'id',
    parseItem: (id) =>
      h(DataTableActions, {
        id: id as string,
        onEdit: permissions.canUpdate ? onEdit : undefined,
        onDelete: permissions.canDelete ? onDelete : undefined,
        deleteMessage: 'Tem certeza que deseja excluir esta role?'
      })
  }
];
