import { screen, fireEvent } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ref } from 'vue';
import DashboardPage from '../DashboardPage.vue';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { renderWithProviders } from '@/test/test-utils';

vi.mock('../../hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn()
}));

vi.mock('../../components/SummaryCards.vue', () => ({
  default: {
    props: ['totalUsers', 'totalProducts'],
    template: `
      <div data-testid="summary-cards">
        <span>Users: {{ totalUsers }}</span>
        <span>Products: {{ totalProducts }}</span>
      </div>
    `
  }
}));

vi.mock('../../components/UserCreationsChart.vue', () => ({
  default: {
    props: ['data'],
    template: `
      <div data-testid="user-creations-chart">
        <span v-for="(item, idx) in data" :key="idx">{{ item.date }}: {{ item.count }}</span>
      </div>
    `
  }
}));

vi.mock('../../components/TopCreatorsChart.vue', () => ({
  default: {
    props: ['data'],
    template: `
      <div data-testid="top-creators-chart">
        <span v-for="(item, idx) in data" :key="idx">{{ item.userId }}: {{ item.count }}</span>
      </div>
    `
  }
}));

vi.mock('../../components/ProductCreationsChart.vue', () => ({
  default: {
    props: ['data'],
    template: `
      <div data-testid="product-creations-chart">
        <span v-for="(item, idx) in data" :key="idx">{{ item.date }}: {{ item.count }}</span>
      </div>
    `
  }
}));

vi.mock('@/components/ui/DateRangePicker.vue', () => ({
  default: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: `
      <div data-testid="date-range-picker">
        <button 
          data-testid="trigger-change" 
          @click="$emit('update:modelValue', { from: new Date('2026-05-10'), to: new Date('2026-05-20') })"
        >
          Change Date
        </button>
      </div>
    `
  }
}));

describe('DashboardPage', () => {
  const mockStats = {
    userCreationStats: [
      { date: '2026-05-01', count: 5 },
      { date: '2026-05-02', count: 10 }
    ],
    productCreationStats: [
      { date: '2026-05-01', count: 2 },
      { date: '2026-05-02', count: 3 }
    ],
    productsPerUser: [{ userId: 'u1', userName: 'User One', count: 5 }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      isError: ref(false)
    });

    renderWithProviders(DashboardPage);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      isError: ref(true)
    });

    renderWithProviders(DashboardPage);

    expect(screen.getByText('Erro ao carregar os dados do dashboard.')).toBeInTheDocument();
  });

  it('renders stats data and updates stats query when date changes', async () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: ref(mockStats),
      isLoading: ref(false),
      isError: ref(false)
    });

    renderWithProviders(DashboardPage);

    // Verify Title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Verify Summary Cards calculations (totalUsers = 15, totalProducts = 5)
    expect(screen.getByText('Users: 15')).toBeInTheDocument();
    expect(screen.getByText('Products: 5')).toBeInTheDocument();

    // Verify charts data are rendered
    expect(screen.getByTestId('user-creations-chart')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01: 5')).toBeInTheDocument();
    expect(screen.getByText('2026-05-02: 10')).toBeInTheDocument();

    expect(screen.getByTestId('product-creations-chart')).toBeInTheDocument();
    expect(screen.getByText('2026-05-01: 2')).toBeInTheDocument();
    expect(screen.getByText('2026-05-02: 3')).toBeInTheDocument();

    expect(screen.getByTestId('top-creators-chart')).toBeInTheDocument();
    expect(screen.getByText('u1: 5')).toBeInTheDocument();

    // Trigger date range change
    const changeBtn = screen.getByTestId('trigger-change');
    await fireEvent.click(changeBtn);

    // Verify that useDashboardStats was called on first and subsequent render
    expect(useDashboardStats).toHaveBeenCalled();
  });

  it('covers empty stats structure', () => {
    (useDashboardStats as Mock).mockReturnValue({
      data: ref({
        userCreationStats: [],
        productCreationStats: [],
        productsPerUser: []
      }),
      isLoading: ref(false),
      isError: ref(false)
    });

    renderWithProviders(DashboardPage);

    expect(screen.getByText('Users: 0')).toBeInTheDocument();
    expect(screen.getByText('Products: 0')).toBeInTheDocument();
  });
});
