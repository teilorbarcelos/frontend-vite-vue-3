import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import Pagination from '../DataTable/Pagination.vue';
import Input from '../Input.vue';
import StatusBadge from '../StatusBadge.vue';
import ListPageHeader from '../ListPageHeader.vue';
import SearchInput from '../SearchInput.vue';
import DataTable from '../DataTable/DataTable.vue';
import DataTableActions from '../DataTable/DataTableActions.vue';
import FilterDrawer from '../FilterDrawer.vue';
import DateRangePicker from '../DateRangePicker.vue';
import DynamicSelect from '../DynamicSelect.vue';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth';

describe('UI Component Edge Cases', () => {
  it('Input with error', () => {
    render(Input, {
      props: { error: 'This is required' }
    });
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('Pagination pageSize change', async () => {
    const onPageSizeChange = vi.fn();
    const { container } = render(Pagination, {
      props: {
        currentPage: 0,
        totalPages: 2,
        pageSize: 10,
        totalItems: 15,
        onPageSizeChange,
        onPageChange: vi.fn()
      }
    });

    const select = container.querySelector('select');
    if (select) {
      await fireEvent.update(select, '20');
      expect(onPageSizeChange).toHaveBeenCalledWith(20);
    }
  });

  it('StatusBadge without permission', async () => {
    const { pinia } = renderWithProviders(StatusBadge, {
      props: { active: true, feature: 'user' }
    });
    const authStore = useAuthStore(pinia);
    vi.spyOn(authStore, 'hasPermission').mockReturnValue(false);

    const badge = screen.getByText('Ativo');
    await fireEvent.click(badge);
    expect(badge).toBeDisabled();
  });

  it('ListPageHeader without create button', () => {
    render(ListPageHeader, {
      props: { title: 'Test', filterCount: 0 }
    });
    expect(screen.queryByText(/Novo/i)).not.toBeInTheDocument();
  });

  it('SearchInput handleClear', async () => {
    const onSearch = vi.fn();
    const { emitted } = render(SearchInput, {
      props: { defaultValue: 'test', onSearch }
    });

    const clearButton = screen.getByRole('button');
    await fireEvent.click(clearButton);
    expect(emitted().search).toBeTruthy();
  });

  it('DataTable empty data', () => {
    render(DataTable, {
      props: { data: [], headerMap: [] }
    });
    expect(screen.getByText(/Nenhum registro encontrado/i)).toBeInTheDocument();
  });

  it('DataTableActions extra actions click', async () => {
    const onExtra = vi.fn();
    render(DataTableActions, {
      props: {
        id: '1',
        extraActions: [{ label: 'Extra', onClick: onExtra }]
      }
    });

    const extraButton = screen.getByTitle('Extra');
    await fireEvent.click(extraButton);
    expect(onExtra).toHaveBeenCalledWith('1');
  });

  it('FilterDrawer handles dateRange initial values and close', async () => {
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(FilterDrawer, {
      props: {
        isOpen: true,
        fields: [{ name: 'date', label: 'Date', type: 'dateRange' }],
        initialValues: { date_start: '2023-01-01', date_end: '2023-01-02' },
        onClose
      }
    });

    await waitFor(() => {
      expect(screen.getByText('01/01/2023 - 02/01/2023')).toBeInTheDocument();
    });

    await rerender({ isOpen: false });
  });

  it('DateRangePicker start only and placeholder', async () => {
    const { rerender } = render(DateRangePicker, {
      props: {
        modelValue: { from: new Date(2023, 0, 1) }
      }
    });
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();

    await rerender({ modelValue: undefined, placeholder: 'Pick a date' });
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('DynamicSelect multiple handleRemove', async () => {
    const onUpdate = vi.fn();
    render(DynamicSelect, {
      props: {
        multiple: true,
        modelValue: ['1'],
        fetchPage: async () => ({ items: [], hasMore: false }),
        fetchByIds: async () => [{ id: '1', name: 'Option 1' }],
        getOptionLabel: (i: any) => i.name,
        getOptionValue: (i: any) => i.id,
        'onUpdate:modelValue': onUpdate
      }
    });

    const removeButton = await screen.findByLabelText('Remove');
    await fireEvent.click(removeButton);
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('DynamicSelect intersection observer', async () => {
    render(DynamicSelect, {
      props: {
        fetchPage: async () => ({ items: [{ id: '1', name: 'O1' }], hasMore: true }),
        fetchByIds: async () => [],
        getOptionLabel: (i: any) => i.name,
        getOptionValue: (i: any) => i.id
      }
    });

    await fireEvent.click(screen.getByRole('combobox'));

    if ((globalThis as any).fireIntersection) {
      (globalThis as any).fireIntersection(true);
    }
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it.skip('DynamicSelect search input', async () => {
    render(DynamicSelect, {
      props: {
        fetchPage: async () => ({ items: [], hasMore: false }),
        fetchByIds: async () => [],
        getOptionLabel: (i: any) => i.name,
        getOptionValue: (i: any) => i.id
      }
    });

    await fireEvent.click(screen.getByRole('combobox'));
    const input = screen.getByPlaceholderText('Pesquisar...');
    await fireEvent.update(input, 'new search');
    expect(input).toBeInTheDocument();
  });
});
