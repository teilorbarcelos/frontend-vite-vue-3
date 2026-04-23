import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Define a function to get a fresh mock instance that is also a function
const createMockAxiosInstance = () => {
  const instance = vi.fn() as any;
  instance.interceptors = {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  };
  instance.get = vi.fn();
  instance.post = vi.fn();
  instance.put = vi.fn();
  instance.delete = vi.fn();
  instance.patch = vi.fn();
  instance.defaults = { headers: { common: {} } };
  return instance;
};

let mockAxiosInstance = createMockAxiosInstance();

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
    }
  };
});

describe('axios lib', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    mockAxiosInstance = createMockAxiosInstance();
  });

  it('registers request and response interceptors', async () => {
    await import('../axios');
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('request interceptor adds authorization header if token exists', async () => {
    await import('../axios');
    const requestInterceptor = (mockAxiosInstance.interceptors.request.use as any).mock.calls[0][0];
    localStorage.setItem('token', 'test-token');
    
    const config = { headers: {} };
    const result = requestInterceptor(config);
    
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('response interceptor handles 401 error and tries to refresh token', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    
    localStorage.setItem('refreshToken', 'old-refresh-token');
    const mockResponse = { data: { token: 'new-token', refreshToken: 'new-refresh-token' } };
    (axios.post as any).mockResolvedValue(mockResponse);
    
    const error = {
      response: { status: 401 },
      config: { url: '/test', headers: {}, _retry: false }
    };
    
    // Trigger the interceptor
    await responseErrorInterceptor(error);
    
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/refresh'), { refreshToken: 'old-refresh-token' });
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    // Verify that it tried to re-run the request
    expect(mockAxiosInstance).toHaveBeenCalled();
  });

  it('response interceptor redirects to login on refresh failure', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    
    localStorage.setItem('refreshToken', 'old-refresh-token');
    (axios.post as any).mockRejectedValue(new Error('Refresh failed'));
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
    
    const error = {
      response: { status: 401 },
      config: { url: '/test', headers: {}, _retry: false }
    };
    
    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // Expected
    }
    
    expect(window.location.href).toBe('/login');
    window.location = originalLocation as any;
  });

  it('response interceptor rethrows non-401 errors', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    const error = { response: { status: 500 }, config: {} };
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
  });

  it('response interceptor does not retry if already a retry', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    const error = { response: { status: 401 }, config: { _retry: true } };
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
  });

  it('response interceptor does not retry on login request', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    const error = { response: { status: 401 }, config: { url: '/v1/auth/login' } };
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
  });
  it('response interceptor handles successful response', async () => {
    await import('../axios');
    const responseInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][0];
    const response = { data: 'ok' };
    expect(responseInterceptor(response)).toBe(response);
  });

  it('response interceptor redirects to login if no refresh token', async () => {
    await import('../axios');
    const responseErrorInterceptor = (mockAxiosInstance.interceptors.response.use as any).mock.calls[0][1];
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
    
    const error = {
      response: { status: 401 },
      config: { url: '/test', headers: {}, _retry: false }
    };
    
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    
    expect(window.location.href).toBe('/login');
    expect(localStorage.getItem('token')).toBeNull();
    window.location = originalLocation as any;
  });
});
