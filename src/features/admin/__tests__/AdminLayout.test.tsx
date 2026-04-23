import { screen, waitFor, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLayout from '../AdminLayout.vue';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
      removeQueries: vi.fn(),
      clear: vi.fn(),
    })),
    useQuery: vi.fn(() => ({
      data: { value: null },
      isLoading: { value: false },
    })),
  };
});

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with sidebar and header', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = { id: '1', name: 'John Doe' } as any;
    // Mock hasPermission to return true for everything
    authStore.hasPermission = vi.fn().mockReturnValue(true);

    renderWithProviders(AdminLayout, { pinia });

    expect(await screen.findByText('Admin Panel')).toBeInTheDocument();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('filters navigation items based on permissions', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    
    // Only allow dashboard
    authStore.hasPermission = vi.fn().mockImplementation((feature) => feature === 'dashboard');

    renderWithProviders(AdminLayout, { pinia });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Perfis')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuários')).not.toBeInTheDocument();
    expect(screen.queryByText('Produtos')).not.toBeInTheDocument();
  });

  it('handles logout', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    const logoutSpy = vi.spyOn(authStore, 'logout');
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    renderWithProviders(AdminLayout, { pinia });

    const logoutButton = await screen.findByTitle('Sair');
    await fireEvent.click(logoutButton);

    expect(logoutSpy).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  it('shows fallback "User" when name is missing', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = { id: '1' } as any; // No name
    authStore.hasPermission = vi.fn().mockReturnValue(true);

    renderWithProviders(AdminLayout, { pinia });

    expect(await screen.findByText('User')).toBeInTheDocument();
  });

  it('highlights active navigation item', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = { id: '1', name: 'John Doe' } as any;
    authStore.hasPermission = vi.fn().mockReturnValue(true);

    const { router } = renderWithProviders(AdminLayout, { pinia });
    
    // Navigate to /dashboard
    await router.push('/dashboard');
    await router.isReady();

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toHaveClass('bg-indigo-50');
  });
});
