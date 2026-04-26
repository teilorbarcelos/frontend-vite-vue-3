import type { RouteRecordRaw } from 'vue-router';

export const roleRoutes: RouteRecordRaw[] = [
  {
    path: 'roles',
    name: 'roles',
    component: () => import('./pages/RoleListPage.vue'),
    meta: { feature: 'role', action: 'view' }
  },
  {
    path: 'roles/new',
    name: 'roles-new',
    component: () => import('./pages/RoleFormPage.vue'),
    meta: { feature: 'role', action: 'create' }
  },
  {
    path: 'roles/update/:id',
    name: 'roles-update',
    component: () => import('./pages/RoleFormPage.vue'),
    meta: { feature: 'role', action: 'create' }
  }
];
