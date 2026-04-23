import { createPinia, setActivePinia } from 'pinia';
import { render } from '@testing-library/vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createRouter, createMemoryHistory } from 'vue-router';
import type { Component } from 'vue';
import ToastProvider from '@/components/ui/Toast/ToastProvider.vue';
import { h } from 'vue';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

export function renderWithProviders(component: Component, options: any = {}) {
  const queryClient = options.queryClient || createTestQueryClient();
  const pinia = options.pinia || createPinia();
  setActivePinia(pinia);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      {
        path: '/dashboard',
        component: { template: '<div>Dashboard</div>' },
        meta: { title: 'Dashboard' }
      },
      { path: '/products', component: { template: '<div>Products</div>' } },
      { path: '/products/new', component: { template: '<div>New Product</div>' } },
      { path: '/products/update/:id', component: { template: '<div>Update Product</div>' } },
      { path: '/users', component: { template: '<div>Users</div>' } },
      { path: '/roles', component: { template: '<div>Roles</div>' } }
    ]
  });

  // Wrap component in ToastProvider to support toast testing
  const WrappedComponent = {
    setup() {
      return () =>
        h(ToastProvider, null, {
          default: () => h(component, options.props)
        });
    }
  };

  const result = render(WrappedComponent, {
    global: {
      plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
      stubs: {
        RouterLink: false,
        RouterView: false
      }
    },
    ...options
  });

  return {
    ...result,
    router,
    queryClient,
    pinia
  };
}
