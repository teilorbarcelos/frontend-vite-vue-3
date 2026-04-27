import { api } from '@/lib/axios';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface ResetPasswordPayload {
  email: string | null;
  token: string | null;
  password?: string;
}

export interface TokenValidationResponse {
  valid: boolean;
}

export const authService = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async login(data: LoginPayload) {
    const response = await api.post('/v1/auth/login', data);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async requestPasswordReset(email: string) {
    const response = await api.post('/v1/auth/password/request', { email });
    return response.data;
  },

  async validateResetToken(email: string, token: string): Promise<TokenValidationResponse> {
    const response = await api.post('/v1/auth/password/validate', { email, token });
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async resetPassword(data: ResetPasswordPayload) {
    const response = await api.post('/v1/auth/password/change', data);
    return response.data;
  }
};
