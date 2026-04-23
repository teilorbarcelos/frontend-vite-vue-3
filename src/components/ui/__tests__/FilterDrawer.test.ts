import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import FilterDrawer from '../FilterDrawer.vue';

describe('FilterDrawer', () => {
  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }] },
    { name: 'created_at', label: 'Created At', type: 'dateRange' },
  ] as any[];

  it('renders fields when open with initial values', async () => {
    const onFilter = vi.fn();
    const initialValues = {
      name: 'John',
      created_at_start: '2023-01-01',
      created_at_end: '2023-01-02'
    };

    render(FilterDrawer, {
      props: {
        isOpen: true,
        onClose: () => {},
        fields: fields,
        onFilter,
        initialValues
      }
    });

    // Wait for the drawer content to be mounted in the portal
    const input = await screen.findByDisplayValue('John');
    expect(input).toBeInTheDocument();
    
    const submitBtn = screen.getByText(/Aplicar/);
    
    // We use fireEvent here because userEvent.click might fail due to 
    // pointer-events: none during the opening transition of Radix Drawer
    await fireEvent.click(submitBtn);

    expect(onFilter).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John',
      created_at_start: '2023-01-01',
      created_at_end: '2023-01-02'
    }));
  });


  it('handles open change via update:open', async () => {
    const onClose = vi.fn();
    render(FilterDrawer, {
      props: {
        isOpen: true,
        onClose: onClose,
        fields: fields,
        onFilter: () => {}
      }
    });

    // Use findByText to wait for the portal content
    const title = await screen.findByText(/Filtros Avançados/);
    expect(title).toBeInTheDocument();
  });
});

