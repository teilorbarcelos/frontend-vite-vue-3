import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DateRangePicker from '../DateRangePicker.vue';

describe('DateRangePicker', () => {
  it('renders with placeholder when no value', () => {
    render(DateRangePicker, { props: { placeholder: 'Select range' } });
    expect(screen.getByText('Select range')).toBeInTheDocument();
  });

  it('renders single date when only from is provided', () => {
    const value = { from: new Date(2024, 0, 1) };
    render(DateRangePicker, { props: { modelValue: value } });
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
  });

  it('renders date range when both are provided', () => {
    const value = { from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) };
    render(DateRangePicker, { props: { modelValue: value } });
    expect(screen.getByText(/01\/01\/2024.*31\/01\/2024/)).toBeInTheDocument();
  });

  it('opens popover on click', async () => {
    const user = userEvent.setup();
    render(DateRangePicker);
    
    await user.click(screen.getByRole('button'));
    
    // Check for grid in calendar
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });
});
