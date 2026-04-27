import { watch } from 'vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/layouts/AppLayout.vue';
import LoginPage from '@/features/auth/pages/LoginPage.vue';
import ErrorPage from '@/components/ui/ErrorPage.vue';

import { roleRoutes } from '@/features/role/role.routes';
import { userRoutes } from '@/features/user/user.routes';
import { productRoutes } from '@/features/product/product.routes';
// [PLOP_IMPORT_MARKER]

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/features/auth/pages/ForgotPasswordPage.vue')
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/features/auth/pages/ResetPasswordPage.vue')
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/pages/DashboardPage.vue')
      },
      ...roleRoutes,
      ...userRoutes,
      ...productRoutes
      // [PLOP_ROUTE_MARKER]
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

type PermissionAction = 'view' | 'create' | 'delete' | 'activate';

declare module 'vue-router' {
  interface RouteMeta {
    feature?: string;
    action?: PermissionAction;
  }
}

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

  const publicRoutes = ['login', 'forgot-password', 'reset-password'];

  if (!publicRoutes.includes(to.name as string) && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.feature && to.meta.action) {
    if (!authStore.hasPermission(to.meta.feature, to.meta.action)) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
