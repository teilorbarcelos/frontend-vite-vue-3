import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import DataTable from '../DataTable.vue';
import type { HeaderMapItem } from '../types';

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const headerMap: HeaderMapItem<any>[] = [
    { title: 'Name', keyItem: 'name', sortable: true },
    { title: 'Email', keyItem: 'email' },
  ];

  it('renders data correctly', () => {
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2
      }
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows empty state when no data is provided', () => {
    render(DataTable, {
      props: {
        data: [],
        headerMap: headerMap,
        totalItems: 0
      }
    });

    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();
  });

  it('shows loading indicator', () => {
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2,
        isLoading: true
      }
    });

    // Check for the loader icon (Loader2)
    expect(screen.getByRole('table').parentElement?.previousSibling).toHaveClass('absolute inset-0');
  });

  it('handles sorting click', async () => {
    const onSortChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2,
        sorting: {
          value: { orderBy: 'name', orderDirection: 'asc' },
          onChange: onSortChange
        }
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'desc'
    });
  });

  it('resets page to 0 when sorting changes', async () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 100,
        sorting: {
          value: { orderBy: undefined, orderDirection: undefined },
          onChange: onSortChange
        },
        paginationProps: {
          currentPage: 2,
          totalPages: 4,
          pageSize: 25,
          onPageChange,
          totalItems: 100
        }
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});
