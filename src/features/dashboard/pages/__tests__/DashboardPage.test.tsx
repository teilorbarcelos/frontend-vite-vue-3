import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import DashboardPage from '../DashboardPage.vue';

describe('DashboardPage', () => {
  it('renders empty dashboard state', () => {
    renderWithProviders(DashboardPage);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
