import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn()
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls correct endpoint', async () => {
    const payload = { email: 'test@t.com', password: 'pwd' };
    (api.post as any).mockResolvedValueOnce({ data: { token: '123' } });

    await authService.login(payload);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', payload);
  });

  it('requestPasswordReset calls correct endpoint', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { message: 'ok' } });

    await authService.requestPasswordReset('test@t.com');
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/request', { email: 'test@t.com' });
  });

  it('validateResetToken calls correct endpoint', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { valid: true } });

    await authService.validateResetToken('test@t.com', 'token123');
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/validate', {
      email: 'test@t.com',
      token: 'token123'
    });
  });

  it('resetPassword calls correct endpoint', async () => {
    const payload = { email: 'test@t.com', token: '123', password: 'new' };
    (api.post as any).mockResolvedValueOnce({ data: { message: 'ok' } });

    await authService.resetPassword(payload);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/change', payload);
  });
});
