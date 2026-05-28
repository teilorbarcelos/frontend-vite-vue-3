import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import UserListPage from '../UserListPage.vue';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import { userService } from '../../services/user.service';

vi.mock('../../services/user.service', () => ({
  userService: {
    getUsers: vi.fn(),
    deleteUser: vi.fn(),
    toggleStatus: vi.fn(),
    exportUsersPdf: vi.fn()
  }
}));

describe('UserListPage', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      created_at: '2023-01-01'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      active: false,
      created_at: '2023-01-02'
    }
  ];

  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (userService.getUsers as Mock).mockResolvedValue({
      items: mockUsers,
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
        permissions: [{ feature: 'user', view: true, create: true, delete: true, activate: true }]
      }
    });
  };

  it('renders page title and user data', async () => {
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    expect(screen.getByText('Usuários')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('navigates to create user page', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    const { router } = renderWithProviders(UserListPage, { queryClient });
    const pushSpy = vi.spyOn(router, 'push');

    const newButton = await screen.findByText(/Novo Usuário/i);
    await user.click(newButton);
    expect(pushSpy).toHaveBeenCalled();
  });

  it('shows error state if fetch fails', async () => {
    (userService.getUsers as Mock).mockRejectedValue(new Error('Fetch failed'));
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuários')).toBeInTheDocument();
    });
  });

  it('triggers delete mutation when delete is clicked', async () => {
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockResolvedValue({});
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => screen.getByText('John Doe'));

    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);

    const deleteOption = await screen.findByText('Excluir');
    await user.click(deleteOption);

    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockResolvedValue({});
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => screen.getByText('John Doe'));

    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);

    await waitFor(() => {
      expect(userService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

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

  it('handles toggle status generic error', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockRejectedValue(new Error('Generic Error'));
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => screen.getByText('John Doe'));
    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar status.')).toBeInTheDocument();
    });
  });

  it('triggers search when search input changes', async () => {
    const user = userEvent.setup();
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    const searchInput = await screen.findByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');

    await waitFor(
      () => {
        expect(userService.getUsers).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => screen.getByText('John Doe'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('handles toggle status mutation error', async () => {
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockRejectedValue({
      response: { data: { message: 'Toggle failed' } }
    });
    setAdminPermissions();
    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => screen.getByText('John Doe'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Toggle failed')).toBeInTheDocument();
    });
  });

  it('renders without create button when permission is missing', async () => {
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'No Perms User',
      role: { id: '1', name: 'Admin', permissions: [] }
    });

    renderWithProviders(UserListPage, { queryClient });

    await waitFor(() => expect(screen.getByText('Usuários')).toBeInTheDocument());
    expect(screen.queryByText(/Novo Usuário/i)).not.toBeInTheDocument();
  });

  it('handles delete error', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (userService.deleteUser as Mock).mockRejectedValue(new Error('Delete failed'));

    renderWithProviders(UserListPage, { queryClient });
    await waitFor(() => screen.getByText('John Doe'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Excluir'));
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalled();
    });
  });

  it('navigates to edit page when edit is clicked', async () => {
    setAdminPermissions();
    const user = userEvent.setup();

    const { router } = renderWithProviders(UserListPage, { queryClient });
    const pushSpy = vi.spyOn(router, 'push');
    await waitFor(() => screen.getByText('John Doe'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Editar'));

    expect(pushSpy).toHaveBeenCalledWith('/users/update/1');
  });

  it('toggles user status', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (userService.toggleStatus as Mock).mockResolvedValue({});

    renderWithProviders(UserListPage, { queryClient });
    await waitFor(() => screen.getByText('John Doe'));

    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(userService.toggleStatus).toHaveBeenCalled();
    });
  });

  it('triggers export users PDF flow', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    (userService.exportUsersPdf as Mock).mockResolvedValue(mockBlob);

    renderWithProviders(UserListPage, { queryClient });

    const exportButton = await screen.findByRole('button', { name: /Exportar PDF/i });
    await user.click(exportButton);

    expect(userService.exportUsersPdf).toHaveBeenCalled();
  });
});
