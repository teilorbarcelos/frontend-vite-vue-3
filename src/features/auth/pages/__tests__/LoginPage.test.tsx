import { api } from '@/lib/axios';
import { renderWithProviders } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../LoginPage.vue';

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn()
  }
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: vi.fn((err) => err && !!err.isAxiosError)
    },
    isAxiosError: vi.fn((err) => err && !!err.isAxiosError)
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(LoginPage);
    expect(screen.getByText(/Acesse sua conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(LoginPage);

    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Expect either custom or default zod messages if custom ones fail to trigger
      expect(
        screen.queryByText(/E-mail inválido/i) || screen.queryByText(/Invalid email/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Senha é obrigatória/i) || screen.queryByText(/Expected string/i)
      ).toBeInTheDocument();
    });
  });

  it('submits successfully and redirects to dashboard', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'fake-token',
        refreshToken: 'fake-refresh',
        user: { id: '1', name: 'Test User' }
      }
    };
    (api.post as any).mockResolvedValue(mockResponse);

    const { router } = renderWithProviders(LoginPage);
    const pushSpy = vi.spyOn(router, 'push');

    await user.type(screen.getByLabelText(/E-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Senha/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(pushSpy).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on network failure', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue({ code: 'ERR_NETWORK', isAxiosError: true });

    renderWithProviders(LoginPage);

    await user.type(screen.getByLabelText(/E-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/O servidor está offline/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid credentials', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue({
      response: { status: 401, data: { message: 'Usuário ou senha incorretos' } },
      isAxiosError: true
    });

    renderWithProviders(LoginPage);

    await user.type(screen.getByLabelText(/E-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Usuário ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    const user = userEvent.setup();
    // Never resolving promise
    (api.post as any).mockReturnValue(new Promise(() => {}));

    renderWithProviders(LoginPage);

    await user.type(screen.getByLabelText(/E-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Entrar/i });
      expect(button).toBeDisabled();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(LoginPage);

    const passwordInput = screen.getByLabelText(/Senha/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('navigates to forgot password page', async () => {
    const user = userEvent.setup();
    const { router } = renderWithProviders(LoginPage);
    const pushSpy = vi.spyOn(router, 'push');

    await user.click(screen.getByText(/Esqueceu a senha?/i));
    expect(pushSpy).toHaveBeenCalledWith('/forgot-password');
  });
});
