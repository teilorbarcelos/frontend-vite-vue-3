import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ProductFormPage from '../ProductFormPage.vue';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import { productService } from '../../services/product.service';
import { useRoute, useRouter } from 'vue-router';

vi.mock('../../services/product.service', () => ({
  productService: {
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useRoute: vi.fn(),
    useRouter: vi.fn(),
  };
});

describe('ProductFormPage', () => {
  const mockNavigate = vi.fn();
  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoute as Mock).mockReturnValue({ params: { id: 'new' } });
    (useRouter as Mock).mockReturnValue({ push: mockNavigate });
    queryClient = createTestQueryClient();
  });

  it('renders "New Product" title', () => {
    renderWithProviders(ProductFormPage, { queryClient });
    expect(screen.getByText('New Product')).toBeInTheDocument();
  });

  it('submits correctly for new product', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockResolvedValue({});
    renderWithProviders(ProductFormPage, { queryClient });
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');
    
    await user.click(screen.getByText('Save Product'));
    
    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('submits correctly in edit mode', async () => {
    const user = userEvent.setup();
    const mockProduct = { id: '1', name: 'Product A', price: 100, sku: 'S1', category: 'C1', stock: 5, description: 'D1' };
    (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
    (productService.getProduct as Mock).mockResolvedValue(mockProduct);
    (productService.updateProduct as Mock).mockResolvedValue({});

    renderWithProviders(ProductFormPage, { queryClient });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue('Product A');
    });
    
    await user.click(screen.getByText('Save Product'));
    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(ProductFormPage, { queryClient });
    
    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await user.click(cancelButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    
    await user.click(cancelButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('handles submission error with message', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockRejectedValue({
      response: { data: { message: 'API Error Message' } }
    });
    
    renderWithProviders(ProductFormPage, { queryClient });
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');

    await user.click(screen.getByText('Save Product'));
    
    expect(await screen.findByText(/API Error Message/i)).toBeInTheDocument();
  });

  it('handles submission error without message', async () => {
    const user = userEvent.setup();
    (productService.createProduct as Mock).mockRejectedValue(new Error('Generic Error'));
    
    renderWithProviders(ProductFormPage, { queryClient });
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Desc');

    await user.click(screen.getByText('Save Product'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar produto. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('shows "Saving..." text when mutation is pending', async () => {
    const user = userEvent.setup();
    // Return a promise that never resolves to simulate pending state
    (productService.createProduct as Mock).mockReturnValue(new Promise(() => {}));
    
    renderWithProviders(ProductFormPage, { queryClient });
    
    await user.type(screen.getByLabelText(/Name/i), 'New Product');
    await user.type(screen.getByLabelText(/SKU/i), 'SKU-1');
    await user.type(screen.getByLabelText(/Category/i), 'C1');
    await user.type(screen.getByLabelText(/Price/i), '150');
    await user.type(screen.getByLabelText(/Stock/i), '10');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    
    await user.click(screen.getByText('Save Product'));
    
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
