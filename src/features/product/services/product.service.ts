import { api } from '@/lib/axios';
import type { PaginatedResponse } from '@/lib/types';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  active: boolean;
}

export const productService = {
  getProducts: async (options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }): Promise<PaginatedResponse<Product>> => {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;
    const res = await api.get(`/v1/product${all ? '/all' : ''}`, {
      params: {
        page,
        size,
        ...(searchWord ? { searchWord, searchFields: searchFields?.join(',') } : {}),
        ...filters,
        ...(sort?.orderBy ? { orderBy: sort.orderBy, orderDirection: sort.orderDirection } : {})
      }
    });
    return res.data;
  },
  getProduct: async (id: string): Promise<Product> => {
    const res = await api.get(`/v1/product/${id}`);
    return res.data;
  },
  createProduct: async (data: Omit<Product, 'id' | 'active'>): Promise<Product> => {
    const res = await api.post('/v1/product', data);
    return res.data;
  },
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/v1/product/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    const res = await api.delete(`/v1/product/${id}`);
    return res.data;
  },
  toggleStatus: async (id: string, active: boolean): Promise<void> => {
    const res = await api.patch(`/v1/product/${id}/status`, { active });
    return res.data;
  }
};
