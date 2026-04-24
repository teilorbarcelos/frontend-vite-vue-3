import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ProductListPage from '../ProductListPage.vue';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import { productService } from '../../services/product.service';

vi.mock('../../services/product.service', () => ({
  productService: {
    getProducts: vi.fn(),
    deleteProduct: vi.fn(),
    toggleStatus: vi.fn()
  }
}));

describe('ProductListPage', () => {
  const mockProducts = [
    { id: '1', name: 'Product A', sku: 'SKU1', price: 100, active: true, created_at: '2023-01-01' },
    { id: '2', name: 'Product B', sku: 'SKU2', price: 200, active: false, created_at: '2023-01-02' }
  ];

  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getProducts as Mock).mockResolvedValue({
      items: mockProducts,
      total: 2
    });
    queryClient = createTestQueryClient();
  });

  const setAdminPermissions = () => {
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'Test User',
      role: {
        id: '1',
        name: 'Admin',
        permissions: [
          { feature: 'product', view: true, create: true, delete: true, activate: true }
        ]
      }
    });
  };

  it('renders page title and product data', async () => {
    setAdminPermissions();
    renderWithProviders(ProductListPage, { queryClient });

    expect(screen.getByText('Produtos')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('triggers delete mutation', async () => {
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockResolvedValue({});
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    await waitFor(() => screen.getByText('Product A'));

    const menuTriggers = screen.getAllByRole('button', { name: /Abrir menu/i });
    await user.click(menuTriggers[0]);

    const deleteOption = await screen.findByText('Excluir');
    await user.click(deleteOption);

    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => expect(productService.deleteProduct).toHaveBeenCalledWith('1'));
  });

  it('navigates to create product page', async () => {
    const user = userEvent.setup();
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    const newButton = await screen.findByText(/Novo Produto/i);
    await user.click(newButton);
  });

  it('triggers toggle status mutation', async () => {
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockResolvedValue({});
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    await waitFor(() => screen.getByText('Product A'));
    const statusButtons = screen.getAllByRole('button', { name: /Ativo/i });
    await user.click(statusButtons[0]);

    await waitFor(() => {
      expect(productService.toggleStatus).toHaveBeenCalledWith('1', false);
    });
  });

  it('opens and closes filter drawer', async () => {
    const user = userEvent.setup();
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    const filterButton = await screen.findByText('Filtros');
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Limpar');
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument();
    });
  });

  it('triggers search when search input changes', async () => {
    const user = userEvent.setup();
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    const searchInput = await screen.findByPlaceholderText(/Pesquisar/i);
    await user.type(searchInput, 'New Search');

    await waitFor(
      () => {
        expect(productService.getProducts).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  it('handles delete mutation error', async () => {
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    await waitFor(() => screen.getByText('Product A'));
    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(await screen.findByText('Excluir'));
    await user.click(await screen.findByRole('button', { name: /^Excluir$/ }));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('shows error state when fetching fails', async () => {
    (productService.getProducts as Mock).mockRejectedValue(new Error('Fetch failed'));
    setAdminPermissions();

    renderWithProviders(ProductListPage, { queryClient });

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar produtos')).toBeInTheDocument();
    });
  });

  it('renders without create button when permission is missing', async () => {
    queryClient.setQueryData(['auth-user'], {
      id: '1',
      name: 'Test User',
      role: { id: '1', name: 'Admin', permissions: [] }
    });

    renderWithProviders(ProductListPage, { queryClient });

    await waitFor(() => expect(screen.getByText('Produtos')).toBeInTheDocument());
    expect(screen.queryByText(/Novo Produto/i)).not.toBeInTheDocument();
  });

  it('handles delete error', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });

    renderWithProviders(ProductListPage, { queryClient });
    await waitFor(() => screen.getByText('Product A'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Excluir'));
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalled();
    });
  });

  it('navigates to edit page when edit is clicked', async () => {
    setAdminPermissions();
    const user = userEvent.setup();

    const { router } = renderWithProviders(ProductListPage, { queryClient });
    const pushSpy = vi.spyOn(router, 'push');
    await waitFor(() => screen.getByText('Product A'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Editar'));

    expect(pushSpy).toHaveBeenCalledWith('/products/update/1');
  });

  it('toggles product status successfully', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockResolvedValue({});

    renderWithProviders(ProductListPage, { queryClient });
    await waitFor(() => screen.getByText('Product A'));

    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(productService.toggleStatus).toHaveBeenCalled();
    });
  });

  it('handles toggle status error', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (productService.toggleStatus as Mock).mockRejectedValue(new Error('Toggle failed'));

    renderWithProviders(ProductListPage, { queryClient });
    await waitFor(() => screen.getByText('Product A'));

    const statusBadge = screen.getAllByText('Ativo')[0];
    await user.click(statusBadge);

    await waitFor(() => {
      expect(productService.toggleStatus).toHaveBeenCalled();
    });
  });

  it('handles delete error without response message', async () => {
    setAdminPermissions();
    const user = userEvent.setup();
    (productService.deleteProduct as Mock).mockRejectedValue(new Error('Generic Error'));

    renderWithProviders(ProductListPage, { queryClient });
    await waitFor(() => screen.getByText('Product A'));

    await user.click(screen.getAllByRole('button', { name: /Abrir menu/i })[0]);
    await user.click(screen.getByText('Excluir'));
    const confirmButton = await screen.findByRole('button', { name: /^Excluir$/ });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalled();
    });
  });
});
