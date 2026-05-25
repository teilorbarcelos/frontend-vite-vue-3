import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import ProductCreationsChart from '../ProductCreationsChart.vue';

describe('ProductCreationsChart', () => {
  it('renders product creations chart correctly and handles empty and invalid dates', () => {
    const mockData = [
      { date: '2026-05-01', count: 15 },
      { date: '', count: 5 },
      { date: '2026-05', count: 10 }
    ];

    render(ProductCreationsChart, {
      props: {
        data: mockData
      }
    });

    expect(screen.getByText('Criação de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Volume de produtos cadastrados por dia.')).toBeInTheDocument();

    // Verify formatted dates are rendered inside the SVG/text
    expect(screen.getByText('01/05/2026')).toBeInTheDocument();
    expect(screen.getByText('2026-05')).toBeInTheDocument();
  });

  it('shows and hides tooltip on mouse interaction', async () => {
    const mockData = [{ date: '2026-05-01', count: 15 }];
    const { container } = render(ProductCreationsChart, {
      props: { data: mockData }
    });

    const bar = container.querySelector('rect');
    expect(bar).toBeInTheDocument();
    if (!bar) {
      throw new Error('Bar element not found');
    }

    await fireEvent.mouseMove(bar, {
      clientX: 100,
      clientY: 150
    });

    expect(screen.getByText('Quant: 15')).toBeInTheDocument();
    expect(screen.getAllByText('01/05/2026').length).toBeGreaterThan(1);

    await fireEvent.mouseLeave(bar);

    expect(screen.queryByText('Quant: 15')).not.toBeInTheDocument();
  });

  it('handles empty and zero counts data', async () => {
    const { rerender } = render(ProductCreationsChart, {
      props: { data: [] }
    });
    expect(screen.queryByText('01/05/2026')).not.toBeInTheDocument();

    await rerender({ data: [{ date: '2026-05-01', count: 0 }] });
    expect(screen.getByText('01/05/2026')).toBeInTheDocument();
  });

  it('handles mousemove when parentRect is null', async () => {
    const mockData = [{ date: '2026-05-01', count: 15 }];
    const { container } = render(ProductCreationsChart, {
      props: { data: mockData }
    });

    const bar = container.querySelector('rect');
    expect(bar).toBeInTheDocument();
    if (!bar) throw new Error('bar not found');

    Object.defineProperty(bar, 'parentElement', {
      get() {
        return null;
      },
      configurable: true
    });

    await fireEvent.mouseMove(bar, {
      clientX: 100,
      clientY: 150
    });

    expect(screen.getByText('Quant: 15')).toBeInTheDocument();
  });
});
