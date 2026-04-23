import { screen } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import Breadcrumb from '../Breadcrumb.vue';
import { renderWithProviders } from '@/test/test-utils';

describe('Breadcrumb', () => {
  it('renders breadcrumbs based on route', async () => {
    const { router } = renderWithProviders(Breadcrumb);
    
    // Simulate route change to products
    await router.push('/products');
    await router.isReady();

    expect(screen.getByTitle('Home')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('renders deep breadcrumbs', async () => {
    const { router } = renderWithProviders(Breadcrumb);
    
    await router.push('/products/update/123');
    await router.isReady();

    expect(screen.getByTitle('Home')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('handles unknown route segments correctly', async () => {
    const { router } = renderWithProviders(Breadcrumb);
    
    await router.push('/unknown-segment');
    await router.isReady();
    
    expect(screen.getByText('Unknown-segment')).toBeInTheDocument();
  });
});
