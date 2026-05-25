import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import UserCreationsChart from '../UserCreationsChart.vue';

describe('UserCreationsChart', () => {
  const mockData = [
    { date: '2026-05-01', count: 5 },
    { date: '', count: 2 },
    { date: '2026-05', count: 3 }
  ];

  it('renders the chart and formats date labels correctly, handling empty and invalid dates', () => {
    render(UserCreationsChart, {
      props: {
        data: mockData
      }
    });

    expect(screen.getByText('Criação de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Evolução diária de registros no período.')).toBeInTheDocument();

    // Verify formatted dates are rendered inside the SVG/text
    expect(screen.getByText('01/05/2026')).toBeInTheDocument();
    expect(screen.getByText('2026-05')).toBeInTheDocument();
  });

  it('shows and hides tooltip on mouse interaction and handles empty points', async () => {
    // 1. Empty points case
    const { container, rerender } = render(UserCreationsChart, {
      props: { data: [] }
    });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    if (!svg) {
      throw new Error('SVG element not found');
    }

    svg.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 10,
      top: 10,
      width: 500,
      height: 300,
      bottom: 310,
      right: 510
    });

    // Mousemove with no data should return early
    await fireEvent.mouseMove(svg, {
      clientX: 100,
      clientY: 150
    });
    expect(screen.queryByText('Quant:')).not.toBeInTheDocument();

    // 2. Valid data case
    await rerender({ data: mockData });

    // Trigger mousemove on the SVG
    await fireEvent.mouseMove(svg, {
      clientX: 260,
      clientY: 160
    });

    // Tooltip should be visible with "Quant: 2" (closest point is index 1)
    expect(screen.getByText('Quant: 2')).toBeInTheDocument();

    // Trigger mouseleave
    await fireEvent.mouseLeave(svg);

    expect(screen.queryByText('Quant: 2')).not.toBeInTheDocument();
  });

  it('handles a single data point correctly', () => {
    const singleData = [{ date: '2026-05-01', count: 5 }];
    render(UserCreationsChart, {
      props: {
        data: singleData
      }
    });
    expect(screen.getByText('01/05/2026')).toBeInTheDocument();
  });
});
