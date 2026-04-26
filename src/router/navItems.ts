import { LayoutDashboard } from 'lucide-vue-next';
import { roleMenu } from '@/features/role/role.menu';
import { userMenu } from '@/features/user/user.menu';
import { productMenu } from '@/features/product/product.menu';
// [PLOP_IMPORT_MARKER]

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, feature: 'dashboard' },
  roleMenu,
  userMenu,
  productMenu
  // [PLOP_MENU_MARKER]
];
