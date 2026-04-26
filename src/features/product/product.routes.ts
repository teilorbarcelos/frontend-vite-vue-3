import type { RouteRecordRaw } from 'vue-router';

export const productRoutes: RouteRecordRaw[] = [
  {
    path: 'products',
    name: 'products',
    component: () => import('./pages/ProductListPage.vue'),
    meta: { feature: 'product', action: 'view' }
  },
  {
    path: 'products/new',
    name: 'products-new',
    component: () => import('./pages/ProductFormPage.vue'),
    meta: { feature: 'product', action: 'create' }
  },
  {
    path: 'products/update/:id',
    name: 'products-update',
    component: () => import('./pages/ProductFormPage.vue'),
    meta: { feature: 'product', action: 'create' }
  }
];
