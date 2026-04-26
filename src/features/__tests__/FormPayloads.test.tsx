import { screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderWithProviders, createTestQueryClient } from '@/test/test-utils';
import RoleFormPage from '../role/pages/RoleFormPage.vue';
import UserFormPage from '../user/pages/UserFormPage.vue';
import ProductFormPage from '../product/pages/ProductFormPage.vue';
import LoginPage from '../auth/pages/LoginPage.vue';
import { roleService } from '../role/services/role.service';
import { userService } from '../user/services/user.service';
import { productService } from '../product/services/product.service';
import { api } from '@/lib/axios';
import { useRoute } from 'vue-router';

vi.mock('../role/services/role.service', () => ({
  roleService: {
    getRole: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    getFeatures: vi.fn(),
    mageSelect: vi.fn(),
    mageHydrate: vi.fn()
  }
}));

vi.mock('../user/services/user.service', () => ({
  userService: {
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn()
  }
}));

vi.mock('../product/services/product.service', () => ({
  productService: {
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn()
  }
}));

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({ push: vi.fn() }))
  };
});

describe('Form Payloads Verification', () => {
  let queryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('RoleFormPage', () => {
    it('sends updated permissions in payload', async () => {
      const user = userEvent.setup();
      const mockFeatures = [{ id: 'f1', name: 'user', description: 'User Management' }];
      const mockRole = {
        id: '1',
        name: 'Existing Role',
        description: 'Desc',
        RoleFeature: [
          { id_feature: 'f1', view: false, create: false, delete: false, activate: false }
        ]
      };

      (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
      (roleService.getFeatures as Mock).mockResolvedValue(mockFeatures);
      (roleService.getRole as Mock).mockResolvedValue(mockRole);
      (roleService.updateRole as Mock).mockResolvedValue({});

      renderWithProviders(RoleFormPage, { queryClient });

      await waitFor(() => screen.getByLabelText(/Nome do Perfil/i));

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // view
      await user.click(checkboxes[1]); // create

      await user.click(screen.getByText('Salvar Perfil'));

      await waitFor(() => {
        expect(roleService.updateRole).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            permissions: expect.arrayContaining([
              expect.objectContaining({
                id_feature: 'f1',
                view: true,
                create: true,
                delete: false,
                activate: false
              })
            ])
          })
        );
      });
    });
  });

  describe('UserFormPage', () => {
    it('sends updated user data in payload', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        id_role: 'r1',
        phone: '123',
        document: '456'
      };

      (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
      (userService.getUser as Mock).mockResolvedValue(mockUser);
      (userService.updateUser as Mock).mockResolvedValue({});
      (roleService.mageHydrate as Mock).mockResolvedValue([{ id: 'r1', name: 'Admin' }]);

      renderWithProviders(UserFormPage, { queryClient });

      await waitFor(() => screen.getByLabelText(/Name/i));

      await user.clear(screen.getByLabelText(/Name/i));
      await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');

      await user.clear(screen.getByLabelText(/Phone/i));
      await user.type(screen.getByLabelText(/Phone/i), '999');

      await user.click(screen.getByText('Save User'));

      await waitFor(() => {
        expect(userService.updateUser).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Jane Doe',
            phone: '999',
            email: 'john@example.com'
          })
        );
      });
    });
  });

  describe('ProductFormPage', () => {
    it('sends updated product data in payload', async () => {
      const user = userEvent.setup();
      const mockProduct = {
        id: '1',
        name: 'Product A',
        sku: 'SKU-A',
        category: 'Cat A',
        price: 10,
        stock: 5,
        description: 'Desc A'
      };

      (useRoute as Mock).mockReturnValue({ params: { id: '1' } });
      (productService.getProduct as Mock).mockResolvedValue(mockProduct);
      (productService.updateProduct as Mock).mockResolvedValue({});

      renderWithProviders(ProductFormPage, { queryClient });

      await waitFor(() => screen.getByLabelText(/Name/i));

      await user.clear(screen.getByLabelText(/Name/i));
      await user.type(screen.getByLabelText(/Name/i), 'Product B');

      await user.clear(screen.getByLabelText(/Price/i));
      await user.type(screen.getByLabelText(/Price/i), '20');

      await user.click(screen.getByText('Save Product'));

      await waitFor(() => {
        expect(productService.updateProduct).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Product B',
            price: 20
          })
        );
      });
    });
  });

  describe('LoginPage', () => {
    it('sends credentials in payload', async () => {
      const user = userEvent.setup();
      (api.post as Mock).mockResolvedValue({ data: { token: 't', user: {} } });

      renderWithProviders(LoginPage, { queryClient });

      await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /Sign in/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
  });
});
