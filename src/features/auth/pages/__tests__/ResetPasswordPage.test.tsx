import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from '../ResetPasswordPage.vue';
import { renderWithProviders } from '@/test/test-utils';
import { authService } from '../../services/auth.service';

const mockQuery = {
  email: '',
  token: ''
};

const mockRouterPush = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...(actual as any),
    useRoute: () => ({
      query: mockQuery
    }),
    useRouter: () => ({
      push: mockRouterPush
    })
  };
});

vi.mock('../../services/auth.service', () => ({
  authService: {
    validateResetToken: vi.fn(),
    resetPassword: vi.fn()
  }
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.email = '';
    mockQuery.token = '';
  });

  it('shows loading state then error if token is invalid', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValue({ valid: false });
    mockQuery.email = 'test@example.com';
    mockQuery.token = 'invalid';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => {
      expect(screen.getByText(/Link Inválido/i)).toBeInTheDocument();
    });
  });

  it('shows form if token is valid', async () => {
    vi.mocked(authService.validateResetToken).mockResolvedValue({ valid: true });
    mockQuery.email = 'test1@example.com';
    mockQuery.token = 'valid-token-1';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Nova Senha' })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Nova Senha')).toBeInTheDocument();
  });

  it('shows validation error if passwords do not match', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.validateResetToken).mockResolvedValue({ valid: true });
    mockQuery.email = 'test2@example.com';
    mockQuery.token = 'valid-token-2';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => screen.getByLabelText('Nova Senha'));

    await user.type(screen.getByLabelText('Nova Senha'), 'password123');
    await user.type(screen.getByLabelText('Confirmar Nova Senha'), 'different');
    await user.click(screen.getByRole('button', { name: /Redefinir Senha/i }));

    await waitFor(() => {
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and redirects', async () => {
    const user = userEvent.setup();

    vi.mocked(authService.validateResetToken).mockResolvedValue({ valid: true });
    vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'Success' });
    mockQuery.email = 'test3@example.com';
    mockQuery.token = 'valid-token-3';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => screen.getByLabelText('Nova Senha'));

    await user.type(screen.getByLabelText('Nova Senha'), 'newpassword123');
    await user.type(screen.getByLabelText('Confirmar Nova Senha'), 'newpassword123');
    await user.click(screen.getByRole('button', { name: /Redefinir Senha/i }));

    await waitFor(() => {
      expect(screen.getByText(/Senha Alterada!/i)).toBeInTheDocument();
    });

    expect(authService.resetPassword).toHaveBeenCalledWith({
      email: 'test3@example.com',
      token: 'valid-token-3',
      password: 'newpassword123'
    });

    await user.click(screen.getByRole('button', { name: /Ir para Login Agora/i }));
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  it('handles validation api error', async () => {
    vi.mocked(authService.validateResetToken).mockRejectedValue(new Error('API Error'));
    mockQuery.email = 'test4@example.com';
    mockQuery.token = 'invalid-4';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => {
      expect(screen.getByText(/Link Inválido/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.validateResetToken).mockResolvedValue({ valid: true });
    mockQuery.email = 'test5@example.com';
    mockQuery.token = 'valid-token-5';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => screen.getByLabelText('Nova Senha'));

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('focus:outline-none'));

    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    await user.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('handles missing params as invalid link', async () => {
    mockQuery.email = '';
    mockQuery.token = '';

    renderWithProviders(ResetPasswordPage);

    await waitFor(() => {
      expect(screen.getByText(/Link Inválido/i)).toBeInTheDocument();
    });
  });
});
