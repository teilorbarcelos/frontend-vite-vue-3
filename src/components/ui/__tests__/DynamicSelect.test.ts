import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DynamicSelect from '../DynamicSelect.vue';

interface TestItem {
  id: string;
  name: string;
}

describe('DynamicSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).clearObservers();
  });

  const mockItems: TestItem[] = [
    { id: '1', name: 'Option 1' },
    { id: '2', name: 'Option 2' },
  ];

  const mockFetchPage = vi.fn().mockResolvedValue({
    items: mockItems,
    hasMore: false,
  });

  const mockFetchByIds = vi.fn().mockResolvedValue([]);

  const defaultProps = {
    label: 'Test Select',
    placeholder: 'Select an option',
    fetchPage: mockFetchPage,
    fetchByIds: mockFetchByIds,
    getOptionLabel: (item: any) => item.name,
    getOptionValue: (item: any) => item.id,
  };

  it('renders with label and placeholder', () => {
    render(DynamicSelect, { props: defaultProps });
    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('opens popover and triggers fetchPage on open', async () => {
    render(DynamicSelect, { props: defaultProps });
    
    const trigger = screen.getByRole('combobox');
    await fireEvent.click(trigger);

    await waitFor(() => {
      expect(mockFetchPage).toHaveBeenCalled();
    });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls update:modelValue when an option is selected', async () => {
    const onUpdateModelValue = vi.fn();
    render(DynamicSelect, { 
      props: { 
        ...defaultProps,
        'onUpdate:modelValue': onUpdateModelValue
      } 
    });
    
    await fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByText('Option 1'));
    
    await fireEvent.click(screen.getByText('Option 1'));
    
    expect(onUpdateModelValue).toHaveBeenCalledWith('1');
  });

  it('triggers loadMore when scrolling to bottom', async () => {
    mockFetchPage.mockResolvedValueOnce({
      items: mockItems,
      hasMore: true,
    });

    render(DynamicSelect, { props: defaultProps });
    
    await fireEvent.click(screen.getByRole('combobox'));
    
    await waitFor(() => screen.getByText('Option 1'));

    // Trigger intersection using global helper from setup.ts
    (globalThis as any).fireIntersection(true);

    await waitFor(() => {
      expect(mockFetchPage).toHaveBeenCalledTimes(2);
    });
  });

  it('renders loading state inside popover', async () => {
    mockFetchPage.mockReturnValueOnce(new Promise(() => {}));
    render(DynamicSelect, { props: defaultProps });
    
    await fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders empty state when no items found', async () => {
    mockFetchPage.mockResolvedValueOnce({ items: [], hasMore: false });
    render(DynamicSelect, { props: defaultProps });
    
    await fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument();
    });
  });
});
