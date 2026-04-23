import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import { api } from '@/lib/axios';

const mockQueryClient = {
  setQueryData: vi.fn(),
  removeQueries: vi.fn(),
  clear: vi.fn(),
};

let capturedQueryFn: any = null;

vi.mock('@tanstack/vue-query', () => {
  return {
    useQueryClient: vi.fn(() => mockQueryClient),
    useQuery: vi.fn((options) => {
      capturedQueryFn = options.queryFn;
      return {
        data: { value: null },
        isLoading: { value: false },
      };
    }),
    VueQueryPlugin: {
      install: vi.fn(),
    },
  };
});

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes correctly', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
  });

  it('queryFn returns user data when token exists', async () => {
    useAuthStore(); // Trigger useQuery
    localStorage.setItem('token', 'test-token');
    (api.get as any).mockResolvedValue({ data: { user: { id: '1', name: 'John' } } });
    
    const user = await capturedQueryFn();
    expect(user).toEqual({ id: '1', name: 'John' });
    expect(api.get).toHaveBeenCalledWith('/v1/auth/me');
  });

  it('queryFn returns null and clears token on error', async () => {
    useAuthStore();
    localStorage.setItem('token', 'test-token');
    (api.get as any).mockRejectedValue(new Error('Unauthorized'));
    
    const user = await capturedQueryFn();
    expect(user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('queryFn returns null if no token', async () => {
    useAuthStore();
    localStorage.removeItem('token');
    
    const user = await capturedQueryFn();
    expect(user).toBeNull();
  });

  it('login updates token and query data', () => {
    const store = useAuthStore();
    const user = { id: '1', name: 'Test' };
    store.login('test-token', 'refresh-token', user as any);
    
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['auth-user'], user);
  });

  it('logout clears token and query client', () => {
    const store = useAuthStore();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh');
    
    store.logout();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ['auth-user'] });
    expect(mockQueryClient.clear).toHaveBeenCalled();
  });

  it('hasPermission logic', () => {
    const store = useAuthStore();
    (store.user as any).value = {
      role: {
        permissions: [{ feature: 'product', view: true, create: false, delete: true, activate: true }]
      }
    };
    
    expect(store.hasPermission('product', 'view')).toBe(true);
    expect(store.hasPermission('product', 'create')).toBe(false);
    expect(store.hasPermission('other', 'view')).toBe(false);
  });

  it('hasPermission returns false if no user or role', () => {
    const store = useAuthStore();
    (store.user as any).value = null;
    expect(store.hasPermission('product', 'view')).toBe(false);

    (store.user as any).value = { role: null };
    expect(store.hasPermission('product', 'view')).toBe(false);
  });
});
