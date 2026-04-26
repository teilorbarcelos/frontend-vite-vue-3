import { api } from '@/lib/axios';
import { getRolePermissions } from '@/utils/validation';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { defineStore } from 'pinia';
import { computed } from 'vue';

export interface Permission {
  feature: string;
  view: boolean;
  create: boolean;
  delete: boolean;
  activate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Permission[];
  };
}

export const useAuthStore = defineStore('auth', () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const res = await api.get('/v1/auth/me');
        return res.data.user as User;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
    },
    staleTime: Infinity,
    retry: false
  });

  const isAuthenticated = computed(() => !!user.value);

  const login = (token: string, refreshToken: string, userData: User): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    queryClient.setQueryData(['auth-user'], userData);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    queryClient.removeQueries({ queryKey: ['auth-user'] });
    queryClient.clear();
  };

  const hasPermission = (feature: string, action: keyof Omit<Permission, 'feature'>): boolean => {
    if (!user.value || !user.value.role) return false;
    const permissions = getRolePermissions(user.value.role) as Permission[];
    const permission = permissions.find((p) => p.feature === feature);
    if (permission) return !!permission[action];
    return import.meta.env.DEV && import.meta.env.MODE !== 'test';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission
  };
});
