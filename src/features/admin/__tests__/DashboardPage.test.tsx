import { screen } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import DashboardPage from '../DashboardPage.vue';
import { renderWithProviders } from '@/test/test-utils';

describe('DashboardPage', () => {
  it('renders dashboard metrics', () => {
    renderWithProviders(DashboardPage);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    expect(screen.getByText('$12,845')).toBeInTheDocument();
    expect(screen.getByText('Novos Pedidos')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('Produtos em Estoque')).toBeInTheDocument();
    expect(screen.getByText('1,240')).toBeInTheDocument();
  });
});
