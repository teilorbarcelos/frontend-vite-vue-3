import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DynamicSelect from '../DynamicSelect.vue';

describe('DynamicSelect', () => {
  const mockItems = [
    { id: '1', name: 'Option 1' },
    { id: '2', name: 'Option 2' }
  ];

  const fetchPage = vi.fn().mockResolvedValue({ items: mockItems, hasMore: false });
  const fetchByIds = vi.fn().mockResolvedValue([]);
  const getOptionLabel = (item: any) => item.name;
  const getOptionValue = (item: any) => item.id;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with label and placeholder', () => {
    render(DynamicSelect, {
      props: {
        label: 'Search Category',
        placeholder: 'Select Category',
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue
      }
    });

    expect(screen.getByText('Search Category')).toBeInTheDocument();
    expect(screen.getByText('Select Category')).toBeInTheDocument();
  });

  it('opens popover and loads data on trigger click', async () => {
    const user = userEvent.setup();
    render(DynamicSelect, {
      props: {
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue
      }
    });

    await user.click(screen.getByRole('combobox'));
    expect(fetchPage).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('filters items based on search input', async () => {
    const user = userEvent.setup();
    render(DynamicSelect, {
      props: {
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue
      }
    });

    await user.click(screen.getByRole('combobox'));
    const input = screen.getByPlaceholderText('Pesquisar...');
    await user.type(input, 'search term');

    await waitFor(() => {
      expect(fetchPage).toHaveBeenCalledWith(1, 'search term', expect.any(Object));
    });
  });

  it('handles item selection in single mode', async () => {
    const user = userEvent.setup();
    const { emitted } = render(DynamicSelect, {
      props: {
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue
      }
    });

    await user.click(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Option 1'));

    await user.click(screen.getByText('Option 1'));

    expect(emitted()['update:modelValue']).toBeTruthy();
    expect(emitted()['update:modelValue'][0]).toEqual(['1']);
  });

  it('handles item selection in multiple mode', async () => {
    const user = userEvent.setup();
    const { emitted } = render(DynamicSelect, {
      props: {
        multiple: true,
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue,
        modelValue: []
      }
    });

    await user.click(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Option 1'));
    await user.click(screen.getByText('Option 1'));

    await waitFor(() => {
      expect(emitted()['update:modelValue']).toBeTruthy();
      expect((emitted()['update:modelValue'] as any[][])[0][0]).toEqual(['1']);
    });
  });

  it('removes item in multiple mode', async () => {
    const { emitted } = render(DynamicSelect, {
      props: {
        multiple: true,
        fetchPage,
        fetchByIds: vi.fn().mockResolvedValue([mockItems[0]]),
        getOptionLabel,
        getOptionValue,
        modelValue: ['1']
      }
    });

    // Option 1 should be rendered as a tag
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove');
    await fireEvent.click(removeButton);

    await waitFor(() => {
      expect(emitted()['update:modelValue']).toBeTruthy();
      expect((emitted()['update:modelValue'] as any[][])[0][0]).toEqual([]);
    });
  });

  it('displays error message', () => {
    render(DynamicSelect, {
      props: {
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue,
        error: 'Required field'
      }
    });
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('sets up intersection observer for infinite scroll', async () => {
    const user = userEvent.setup();
    render(DynamicSelect, {
      props: {
        fetchPage,
        fetchByIds,
        getOptionLabel,
        getOptionValue
      }
    });

    await user.click(screen.getByRole('combobox'));

    // Trigger intersection using the global helper from setup.ts
    (globalThis as any).fireIntersection(true);

    await waitFor(() => {
      expect(fetchPage).toHaveBeenCalled();
    });
  });
});
