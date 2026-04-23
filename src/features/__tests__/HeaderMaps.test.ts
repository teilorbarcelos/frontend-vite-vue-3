import { cleanup, render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProductColumns } from '../product/constants/productHeaderMap';
import { getRoleColumns } from '../role/constants/roleHeaderMap';
import { getUserColumns } from '../user/constants/userHeaderMap';

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    hasPermission: vi.fn().mockReturnValue(true)
  })
}));

describe('HeaderMaps Coverage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const permissions = { canUpdate: true, canDelete: true };
  const mockFn = vi.fn();

  it('ProductHeaderMap coverage', () => {
    const columns = getProductColumns(mockFn, mockFn, mockFn, permissions);

    // Test parseItem for Price
    const priceCol = columns.find((c) => c.keyItem === 'price');
    expect(priceCol?.parseItem?.(100.5, {} as any)).toBe('$100.50');
    expect(priceCol?.parseItem?.(null, {} as any)).toBe('$0.00');

    // Test parseItem for Status
    const statusCol = columns.find((c) => c.keyItem === 'active');
    render({
      render() {
        return statusCol?.parseItem?.(true, { id: '1', active: true } as any) as any;
      }
    });
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find((c) => c.title === '');
    render({
      render() {
        return actionsCol?.parseItem?.('1', { id: '1' } as any) as any;
      }
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('RoleHeaderMap coverage', () => {
    const columns = getRoleColumns(mockFn, mockFn, mockFn, permissions);

    // Test parseItem for Status
    const statusCol = columns.find((c) => c.keyItem === 'active');
    render({
      render() {
        return statusCol?.parseItem?.(true, { id: '1', active: true } as any) as any;
      }
    });
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find((c) => c.title === '');
    render({
      render() {
        return actionsCol?.parseItem?.('1', { id: '1' } as any) as any;
      }
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('UserHeaderMap coverage', () => {
    const columns = getUserColumns(mockFn, mockFn, mockFn, permissions);

    // Test parseItem for Status
    const statusCol = columns.find((c) => c.keyItem === 'active');
    render({
      render() {
        return statusCol?.parseItem?.(true, { id: '1', active: true } as any) as any;
      }
    });
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    cleanup();

    // Test parseItem for Actions
    const actionsCol = columns.find((c) => c.title === '');
    render({
      render() {
        return actionsCol?.parseItem?.('1', { id: '1' } as any) as any;
      }
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders correctly without permissions', () => {
    const noPermissions = { canUpdate: false, canDelete: false };

    const userCols = getUserColumns(mockFn, mockFn, mockFn, noPermissions);
    const roleCols = getRoleColumns(mockFn, mockFn, mockFn, noPermissions);
    const prodCols = getProductColumns(mockFn, mockFn, mockFn, noPermissions);

    [userCols, roleCols, prodCols].forEach((cols) => {
      const actionsCol = cols.find((c) => c.title === '');
      render({
        render() {
          return actionsCol?.parseItem?.('1', { id: '1' } as any) as any;
        }
      });
      cleanup();
    });
  });
});
