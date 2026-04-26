import { describe, it, expect } from 'vitest';
import { useDataTable } from '../useDataTable';

describe('useDataTable', () => {
  it('initializes with default values', () => {
    const { page, size, sort } = useDataTable();
    expect(page.value).toBe(0);
    expect(size.value).toBe(25);
    expect(sort.value).toEqual({});
  });

  it('handles search and resets page', () => {
    const { page, searchWord, handleSearch } = useDataTable();
    page.value = 5;
    handleSearch('test');
    expect(searchWord.value).toBe('test');
    expect(page.value).toBe(0);
  });

  it('handles filters and resets page', () => {
    const { page, filters, handleFilter } = useDataTable();
    page.value = 5;
    handleFilter({ category: 'cat1' });
    expect(filters.value).toEqual({ category: 'cat1' });
    expect(page.value).toBe(0);
  });

  it('handles sort and resets page', () => {
    const { page, sort, handleSort } = useDataTable();
    page.value = 5;
    const newSort = { orderBy: 'id', orderDirection: 'desc' as const };
    handleSort(newSort);
    expect(sort.value).toEqual(newSort);
    expect(page.value).toBe(0);
  });

  it('updates page and size via tableProps', () => {
    const { page, size, tableProps } = useDataTable();

    tableProps.paginationProps.onPageChange(3);
    expect(page.value).toBe(3);

    tableProps.paginationProps.onPageSizeChange(50);
    expect(size.value).toBe(50);
  });
});
