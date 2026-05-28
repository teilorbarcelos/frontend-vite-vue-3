import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import RoleListPage from '../RoleListPage.vue';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import { roleService } from '../../services/role.service';

vi.mock('../../services/role.service', () => ({
  roleService: {
    getRoles: vi.fn(),
    deleteRole: vi.fn(),
    toggleStatus: vi.fn()
  }
}));

describe('RoleListPage', () => {
  const mockRoles = [
    { id: '1', name: 'Admin', active: true, created_at: '2023-01-01' },
    { id: '2', name: 'User', active: false, created_at: '2023-01-02' }
  ];

  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (roleService.getRoles as Mock).mockResolvedValue({
      items: mockRoles,
      total: 2
    });
    queryClient = createTestQueryClient();
  });

  const setAdminPermissions = () => {
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'Test User',
      role: {
        id: '1',
        name: 'Admin',
        permissions: [{ feature: 'role', view: true, create: true, delete: true, activate: true }]
      }
    });
  };

  it('renders page title and role data', async () => {
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    expect(screen.getByText('Roles')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('navigates to create role page', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    const { router } = renderWithProviders(RoleListPage, { queryClient });
    const pushSpy = vi.spyOn(router, 'push');

    const newButton = await screen.findByText(/Nova Role/i);
    await user.click(newButton);
    expect(pushSpy).toHaveBeenCalled();
  });

  it('triggers delete mutation', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockResolvedValue({});
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => screen.getByText('Admin'));

    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);

    const deleteOption = await screen.findByText('Excluir');
    await user.click(deleteOption);

    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(roleService.deleteRole).toHaveBeenCalledWith('1');
    });
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockResolvedValue({});
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => screen.getByText('Admin'));

    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);

    await waitFor(() => {
      expect(roleService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    const filterButton = await screen.findByText('Filtros');
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Limpar');
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument();
    });
  });

  it('triggers search when search input changes', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    const searchInput = await screen.findByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');

    await waitFor(
      () => {
        expect(roleService.getRoles).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Excluir'));
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(roleService.deleteRole).toHaveBeenCalled();
    });
  });

  it('shows error state when fetching fails', async () => {
    (roleService.getRoles as Mock).mockRejectedValue(new Error('Fetch failed'));
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar roles')).toBeInTheDocument();
    });
  });

  it('renders without create button when permission is missing', async () => {
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'No Perms User',
      role: { id: '1', name: 'Admin', permissions: [] }
    });

    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => expect(screen.getByText('Roles')).toBeInTheDocument());
    expect(screen.queryByText(/Nova Role/i)).not.toBeInTheDocument();
  });

  it('navigates to edit page when edit is clicked', async () => {
    setAdminPermissions();
    const user = userEvent.setup();

    const { router } = renderWithProviders(RoleListPage, { queryClient });
    const pushSpy = vi.spyOn(router, 'push');
    await waitFor(() => screen.getByText('Admin'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Editar'));

    expect(pushSpy).toHaveBeenCalledWith('/roles/update/1');
  });

  it('toggles role status successfully', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockResolvedValue({});

    renderWithProviders(RoleListPage, { queryClient });
    await waitFor(() => screen.getByText('Admin'));

    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(roleService.toggleStatus).toHaveBeenCalled();
    });
  });

  it('handles toggle status mutation error with fallback message', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (roleService.toggleStatus as Mock).mockRejectedValue({});

    renderWithProviders(RoleListPage, { queryClient });
    await waitFor(() => screen.getByText('Admin'));

    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(roleService.toggleStatus).toHaveBeenCalled();
    });
  });

  it('handles delete mutation error with fallback message', async () => {
    const user = userEvent.setup();
    (roleService.deleteRole as Mock).mockRejectedValue({});
    setAdminPermissions();
    renderWithProviders(RoleListPage, { queryClient });

    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Excluir'));
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(roleService.deleteRole).toHaveBeenCalled();
    });
  });
});
