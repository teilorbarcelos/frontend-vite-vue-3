import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import DataTable from '../DataTable.vue';
import type { HeaderMapItem } from '../types';

vi.mock('../../Tooltip', () => ({
  TooltipProvider: {
    template: '<div><slot /></div>'
  },
  Tooltip: {
    template: '<div><slot /></div>'
  },
  TooltipTrigger: {
    template: '<div><slot /></div>'
  },
  TooltipContent: {
    template: '<div><slot /></div>'
  }
}));

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  const headerMap: HeaderMapItem<any>[] = [
    { title: 'Name', keyItem: 'name', sortable: true },
    { title: 'Email', keyItem: 'email' }
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
    expect(screen.getByRole('table').parentElement?.previousSibling).toHaveClass(
      'absolute inset-0'
    );
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

  it('handles truncated content with tooltips', async () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      { title: 'Long Text', keyItem: 'text', truncate: true }
    ];
    render(DataTable, {
      props: {
        data: [{ text: 'This is a very long text that should be truncated' }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    const elements = screen.getAllByText('This is a very long text that should be truncated');
    expect(elements.length).toBeGreaterThanOrEqual(2);
    const trigger = elements.find((el) => el.classList.contains('truncate'));
    expect(trigger).toBeDefined();
  });

  it('handles truncated content with custom parseItem returning a component', () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      {
        title: 'Long Text',
        keyItem: 'text',
        truncate: true,
        parseItem: (val) => ({ template: `<span class="custom-comp">${val}</span>` })
      }
    ];
    render(DataTable, {
      props: {
        data: [{ text: 'Some text' }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    const elements = screen.getAllByText('Some text');
    expect(elements.length).toBeGreaterThanOrEqual(2);
    const trigger = elements.find((el) => el.parentElement?.classList.contains('truncate'));
    expect(trigger).toBeDefined();
  });

  it('handles truncated content with custom parseItem returning a string', () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      {
        title: 'Long Text',
        keyItem: 'text',
        truncate: true,
        parseItem: (val) => `Prefix: ${val}`
      }
    ];
    render(DataTable, {
      props: {
        data: [{ text: 'Some text' }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    expect(screen.getAllByText('Prefix: Some text').length).toBeGreaterThanOrEqual(2);
  });

  it('handles custom parseItem returning a component', () => {
    const headerWithComponent: HeaderMapItem<any>[] = [
      {
        title: 'Status',
        keyItem: 'active',
        parseItem: (val) => ({ template: `<span>${val ? 'Active' : 'Inactive'}</span>` })
      }
    ];
    render(DataTable, {
      props: {
        data: [{ active: true }],
        headerMap: headerWithComponent,
        totalItems: 1
      }
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles custom parseItem returning a string', () => {
    const headerWithString: HeaderMapItem<any>[] = [
      {
        title: 'Price',
        keyItem: 'price',
        parseItem: (val) => `$${val}`
      }
    ];
    render(DataTable, {
      props: {
        data: [{ price: 100 }],
        headerMap: headerWithString,
        totalItems: 1
      }
    });
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('handles sort reset (asc -> desc -> undefined)', async () => {
    const onSortChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2,
        sorting: {
          value: { orderBy: 'name', orderDirection: 'desc' },
          onChange: onSortChange
        }
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: undefined,
      orderDirection: undefined
    });
  });

  it('handles null/undefined values in data', () => {
    const dataWithNull = [{ name: 'Null Name', email: undefined, other: null }];
    const headerWithOther = [...headerMap, { title: 'Other', keyItem: 'other' }];
    render(DataTable, {
      props: {
        data: dataWithNull,
        headerMap: headerWithOther,
        totalItems: 1
      }
    });
    expect(screen.getByText('Null Name')).toBeInTheDocument();
    // Cell for email and other should be empty string
    const cells = screen.getAllByRole('cell');
    expect(cells[1].textContent).toBe('');
    expect(cells[2].textContent).toBe('');
  });

  it('handles truncated content with null values', () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      { title: 'Long Text', keyItem: 'text', truncate: true }
    ];
    render(DataTable, {
      props: {
        data: [{ text: null }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    const cells = screen.getAllByRole('cell');
    expect(cells[0].textContent).toBe('');
  });

  it('renders loading overlay correctly', () => {
    const { container } = render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2,
        isLoading: true
      }
    });

    // Check for the Loader2 component container
    const loaderContainer = container.querySelector('.animate-spin');
    expect(loaderContainer).toBeInTheDocument();
    expect(loaderContainer?.parentElement).toHaveClass('absolute inset-0');
  });

  it('calculates total pages correctly when pageSize is provided', () => {
    const onPageChange = vi.fn();
    const { container } = render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 50,
        paginationProps: {
          currentPage: 0,
          pageSize: 10,
          onPageChange,
          totalItems: 50
        }
      }
    });
    // Check pagination (5 pages)
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not sort if sorting option is not provided', async () => {
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);
  });

  it('handles sort when orderDirection is undefined', async () => {
    const onSortChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        totalItems: 2,
        sorting: {
          value: { orderBy: 'name', orderDirection: undefined },
          onChange: onSortChange
        }
      }
    });

    const nameHeader = screen.getByText('Name');
    await fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      orderBy: 'name',
      orderDirection: 'asc'
    });
  });

  it('covers totalItems fallback from paginationProps', () => {
    const onPageChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        paginationProps: {
          currentPage: 0,
          pageSize: 10,
          totalPages: 5,
          totalItems: 50,
          onPageChange
        }
      }
    });

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('handles truncated content with custom parseItem returning a number', () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      {
        title: 'Number Val',
        keyItem: 'num',
        truncate: true,
        parseItem: (val) => Number(val)
      }
    ];
    render(DataTable, {
      props: {
        data: [{ num: 42 }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(2);
  });

  it('covers fallback when totalPages is falsy/undefined', () => {
    const onPageChange = vi.fn();
    render(DataTable, {
      props: {
        data: mockData,
        headerMap: headerMap,
        paginationProps: {
          currentPage: 0,
          pageSize: 10,
          totalPages: undefined,
          totalItems: 50,
          onPageChange
        }
      }
    });
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('handles truncated content with undefined values and custom parseItem returning null', () => {
    const headerWithTruncate: HeaderMapItem<any>[] = [
      {
        title: 'Val',
        keyItem: 'val',
        truncate: true,
        parseItem: () => null
      }
    ];
    render(DataTable, {
      props: {
        data: [{ val: undefined }],
        headerMap: headerWithTruncate,
        totalItems: 1
      }
    });
    const cells = screen.getAllByRole('cell');
    expect(cells[0].textContent).toBe('');
  });
});
