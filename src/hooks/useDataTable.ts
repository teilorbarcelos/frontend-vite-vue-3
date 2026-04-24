import { ref, reactive } from 'vue';
import type { SortDirection, TableSort } from '@/components/ui/DataTable/types';

interface UseDataTableOptions {
  defaultSize?: number;
  defaultSort?: TableSort;
}

export function useDataTable(options: UseDataTableOptions = {}) {
  const {
    defaultSize = 25,
    defaultSort = { orderBy: 'name', orderDirection: 'asc' as SortDirection }
  } = options;

  const page = ref(0);
  const size = ref(defaultSize);
  const searchWord = ref('');
  const filters = ref<Record<string, any>>({});
  const sort = ref<TableSort>(defaultSort);

  const handleSearch = (val: string) => {
    searchWord.value = val;
    page.value = 0;
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    filters.value = newFilters;
    page.value = 0;
  };

  const handleSort = (newSort: TableSort) => {
    sort.value = newSort;
    page.value = 0;
  };

  return {
    page,
    size,
    searchWord,
    filters,
    sort,

    handleSearch,
    handleFilter,
    handleSort,

    tableProps: reactive({
      sorting: { value: sort, onChange: handleSort },
      paginationProps: {
        currentPage: page,
        onPageChange: (p: number) => (page.value = p),
        pageSize: size,
        onPageSizeChange: (s: number) => (size.value = s)
      }
    })
  };
}
