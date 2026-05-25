import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import TopCreatorsChart from '../TopCreatorsChart.vue';

describe('TopCreatorsChart', () => {
  const mockData = [
    { userId: 'u1', userName: 'User One', count: 12 },
    { userId: 'u2', userName: 'User Two', count: 8 }
  ];

  it('renders top creators chart correctly', () => {
    render(TopCreatorsChart, {
      props: {
        data: mockData
      }
    });

    expect(screen.getByText('Top Criadores (Produtos)')).toBeInTheDocument();
    expect(screen.getByText('Usuários que mais cadastraram produtos.')).toBeInTheDocument();

    // Verify user names are rendered on the Y-Axis
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
  });

  it('shows and hides tooltip on mouse interaction', async () => {
    const { container } = render(TopCreatorsChart, {
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

    expect(screen.getByText('Quant: 12')).toBeInTheDocument();
    expect(screen.getAllByText('User One').length).toBeGreaterThan(1);

    await fireEvent.mouseLeave(bar);

    expect(screen.queryByText('Quant: 12')).not.toBeInTheDocument();
  });

  it('handles empty data and zero counts data', async () => {
    const { rerender } = render(TopCreatorsChart, {
      props: { data: [] }
    });
    expect(screen.queryByText('User One')).not.toBeInTheDocument();

    await rerender({ data: [{ userId: 'u1', userName: 'User One', count: 0 }] });
    expect(screen.getByText('User One')).toBeInTheDocument();
  });

  it('handles mousemove when parentRect is null and missing userName fallback to userId', async () => {
    const fallbackData = [{ userId: 'u1-id-only', userName: '', count: 12 }];
    const { container } = render(TopCreatorsChart, {
      props: { data: fallbackData }
    });

    expect(screen.getByText('u1-id-only')).toBeInTheDocument();

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

    expect(screen.getByText('Quant: 12')).toBeInTheDocument();
    expect(screen.getAllByText('u1-id-only').length).toBeGreaterThan(1);
  });
});
