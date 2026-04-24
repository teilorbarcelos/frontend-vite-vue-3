import { watch } from 'vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/features/admin/AdminLayout.vue';
import LoginPage from '@/features/auth/pages/LoginPage.vue';
import ErrorPage from '@/components/ui/ErrorPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/admin/DashboardPage.vue') // I'll create a placeholder
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/features/role/pages/RoleListPage.vue'),
        meta: { feature: 'role', action: 'view' }
      },
      {
        path: 'roles/new',
        name: 'roles-new',
        component: () => import('@/features/role/pages/RoleFormPage.vue'),
        meta: { feature: 'role', action: 'create' }
      },
      {
        path: 'roles/update/:id',
        name: 'roles-update',
        component: () => import('@/features/role/pages/RoleFormPage.vue'),
        meta: { feature: 'role', action: 'create' }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/features/user/pages/UserListPage.vue'),
        meta: { feature: 'user', action: 'view' }
      },
      {
        path: 'users/new',
        name: 'users-new',
        component: () => import('@/features/user/pages/UserFormPage.vue'),
        meta: { feature: 'user', action: 'create' }
      },
      {
        path: 'users/update/:id',
        name: 'users-update',
        component: () => import('@/features/user/pages/UserFormPage.vue'),
        meta: { feature: 'user', action: 'create' }
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/features/product/pages/ProductListPage.vue'),
        meta: { feature: 'product', action: 'view' }
      },
      {
        path: 'products/new',
        name: 'products-new',
        component: () => import('@/features/product/pages/ProductFormPage.vue'),
        meta: { feature: 'product', action: 'create' }
      },
      {
        path: 'products/update/:id',
        name: 'products-update',
        component: () => import('@/features/product/pages/ProductFormPage.vue'),
        meta: { feature: 'product', action: 'create' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: ErrorPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Wait for auth to initialize if it's the first load
  if (authStore.isLoading && localStorage.getItem('token')) {
    await new Promise((resolve) => {
      const unwatch = watch(
        () => authStore.isLoading,
        (loading) => {
          if (!loading) {
            unwatch();
            resolve(true);
          }
        }
      );
    });
  }

  if (to.name !== 'login' && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.feature && to.meta.action) {
    if (!authStore.hasPermission(to.meta.feature as string, to.meta.action as any)) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
