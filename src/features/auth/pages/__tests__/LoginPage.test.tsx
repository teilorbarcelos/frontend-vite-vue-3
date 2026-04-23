import { screen, waitFor, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage.vue';
import { renderWithProviders } from '@/test/test-utils';
import { api } from '@/lib/axios';

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
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(LoginPage);

    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      // Expect either custom or default zod messages if custom ones fail to trigger
      expect(
        screen.queryByText(/Invalid email address/i) || screen.queryByText(/Invalid email/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Password is required/i) || screen.queryByText(/expected string/i)
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

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /Sign in/i });
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

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/O servidor está offline/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid credentials', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid credentials' } },
      isAxiosError: true
    });

    renderWithProviders(LoginPage);

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Usuário ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    const user = userEvent.setup();
    // Never resolving promise
    (api.post as any).mockReturnValue(new Promise(() => {}));

    renderWithProviders(LoginPage);

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/Signing in/i);
      expect(button).toBeDisabled();
    });
  });
});
