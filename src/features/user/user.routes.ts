import type { RouteRecordRaw } from 'vue-router';

export const userRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'users',
    component: () => import('./pages/UserListPage.vue'),
    meta: { feature: 'user', action: 'view' }
  },
  {
    path: 'users/new',
    name: 'users-new',
    component: () => import('./pages/UserFormPage.vue'),
    meta: { feature: 'user', action: 'create' }
  },
  {
    path: 'users/update/:id',
    name: 'users-update',
    component: () => import('./pages/UserFormPage.vue'),
    meta: { feature: 'user', action: 'create' }
  }
];
