import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataTable } from '../useDataTable';

describe('useDataTable', () => {
  const mockOptions = {
    defaultSize: 10,
    defaultSort: { orderBy: 'name', orderDirection: 'asc' as const },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct defaults', () => {
    const { page, size, sort } = useDataTable(mockOptions);
    expect(page.value).toBe(0);
    expect(size.value).toBe(10);
    expect(sort.value).toEqual(mockOptions.defaultSort);
  });

  it('handleSearch updates searchWord and resets page', () => {
    const { page, searchWord, handleSearch } = useDataTable(mockOptions);
    page.value = 5;
    handleSearch('test');
    expect(searchWord.value).toBe('test');
    expect(page.value).toBe(0);
  });

  it('handleFilter updates filters and resets page', () => {
    const { page, filters, handleFilter } = useDataTable(mockOptions);
    page.value = 5;
    handleFilter({ active: true });
    expect(filters.value).toEqual({ active: true });
    expect(page.value).toBe(0);
  });

  it('handleSort updates sort and resets page', () => {
    const { page, sort, handleSort } = useDataTable(mockOptions);
    page.value = 5;
    const newSort = { orderBy: 'email', orderDirection: 'desc' as const };
    handleSort(newSort);
    expect(sort.value).toEqual(newSort);
    expect(page.value).toBe(0);
  });

  it('pagination callbacks update state', () => {
    const { page, size, tableProps } = useDataTable(mockOptions);
    tableProps.paginationProps.onPageChange(2);
    expect(page.value).toBe(2);
    
    tableProps.paginationProps.onPageSizeChange(50);
    expect(size.value).toBe(50);
  });
});
