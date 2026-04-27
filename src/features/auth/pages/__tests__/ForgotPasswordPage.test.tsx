import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '../ForgotPasswordPage.vue';
import { renderWithProviders } from '@/test/test-utils';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn()
  }
}));

describe('ForgotPasswordPage', () => {
  it('renders correctly', () => {
    renderWithProviders(ForgotPasswordPage);
    expect(screen.getByText(/Recuperar Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(ForgotPasswordPage);

    const emailInput = screen.getByLabelText(/E-mail/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /Enviar Instruções/i }));

    await waitFor(() => {
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and shows success state', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { message: 'Success' } });

    const { router } = renderWithProviders(ForgotPasswordPage);

    await user.type(screen.getByLabelText(/E-mail/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Enviar Instruções/i }));

    await waitFor(() => {
      expect(screen.getByText(/E-mail Enviado/i)).toBeInTheDocument();
      expect(screen.getByText(/Verifique sua caixa de entrada/i)).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/request', {
      email: 'test@example.com'
    });

    const pushSpy = vi.spyOn(router, 'push');
    await user.click(screen.getByRole('button', { name: /Voltar para o Login/i }));
    expect(pushSpy).toHaveBeenCalledWith('/login');
  });

  it('navigates back to login', async () => {
    const user = userEvent.setup();
    const { router } = renderWithProviders(ForgotPasswordPage);
    const pushSpy = vi.spyOn(router, 'push');

    await user.click(screen.getByText(/Voltar para o login/i));
    expect(pushSpy).toHaveBeenCalledWith('/login');
  });
});
