import { screen, waitFor, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import UserFormPage from '../UserFormPage.vue';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import { userService } from '../../services/user.service';
import { roleService } from '@/features/role/services/role.service';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';

vi.mock('../../services/user.service', () => ({
  userService: {
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn()
  }
}));

vi.mock('@/features/role/services/role.service', () => ({
  roleService: {
    mageSelect: vi.fn(),
    mageHydrate: vi.fn()
  }
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useRoute: vi.fn(),
    useRouter: vi.fn()
  };
});

describe('UserFormPage', () => {
  const mockNavigate = vi.fn();
  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoute as Mock).mockReturnValue({ params: { id: 'new' } });
    (useRouter as Mock).mockReturnValue({ push: mockNavigate });
    (roleService.mageSelect as Mock).mockResolvedValue({
      items: [{ id: 'role-1', name: 'Admin' }],
      hasMore: false
    });
    (roleService.mageHydrate as Mock).mockResolvedValue([{ id: 'role-1', name: 'Admin' }]);
    queryClient = createTestQueryClient();
  });

  it('renders "New User" title', () => {
    renderWithProviders(UserFormPage, { queryClient });
    expect(screen.getByText('New User')).toBeInTheDocument();
  });

  it('submits correctly for new user', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockResolvedValue({});
    renderWithProviders(UserFormPage, { queryClient });

    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.type(screen.getByLabelText(/Phone/i), '11999999999');
    await user.type(screen.getByLabelText(/Document/i), '12345678901');

    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New User',
          email: 'new@example.com',
          phone: '11999999999',
          document: '12345678901'
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('shows error when password is missing for new user', async () => {
    const user = userEvent.setup();
    const { pinia } = renderWithProviders(UserFormPage, { queryClient });
    const toastStore = useToastStore(pinia);
    const toastSpy = vi.spyOn(toastStore, 'error');

    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');

    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith('Senha é obrigatória para novos usuários');
    });
  });

  it('submits correctly for existing user', async () => {
    const user = userEvent.setup();
    (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
    (userService.getUser as Mock).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      id_role: 'role-1'
    });
    (userService.updateUser as Mock).mockResolvedValue({});

    renderWithProviders(UserFormPage, { queryClient });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'John Updated');

    await user.click(screen.getByRole('button', { name: /Save User/i }));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'John Updated'
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    userEvent.setup();
    renderWithProviders(UserFormPage, { queryClient });

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await fireEvent.click(cancelButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/users');

    await fireEvent.click(cancelButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('handles submission error with message', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockRejectedValue({
      response: { data: { message: 'API Error Message' } }
    });

    renderWithProviders(UserFormPage, { queryClient });

    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');

    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));

    expect(await screen.findByText(/API Error Message/i)).toBeInTheDocument();
  });

  it('handles submission error without message', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockRejectedValue({
      response: { data: {} }
    });

    renderWithProviders(UserFormPage, { queryClient });

    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');

    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));

    expect(
      await screen.findByText(/Erro ao salvar usuário. Tente novamente./i)
    ).toBeInTheDocument();
  });

  it('shows "Saving..." text when mutation is pending', async () => {
    const user = userEvent.setup();
    (userService.createUser as Mock).mockReturnValue(new Promise(() => {}));
    renderWithProviders(UserFormPage, { queryClient });
    await user.type(screen.getByLabelText(/Name/i), 'New User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');

    await user.click(screen.getByLabelText(/Perfil/i));
    await waitFor(() => screen.getByText('Admin'));
    await user.click(screen.getByText('Admin'));

    await user.click(screen.getByRole('button', { name: /Save User/i }));
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('shows loading state when fetching user data', async () => {
    (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
    (userService.getUser as Mock).mockReturnValue(new Promise(() => {}));

    renderWithProviders(UserFormPage, { queryClient });

    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });
});
