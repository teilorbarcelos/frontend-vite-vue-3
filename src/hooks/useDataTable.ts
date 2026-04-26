import type { TableSort } from '@/components/ui/DataTable/types';
import type { Ref } from 'vue';
import { reactive, ref } from 'vue';

interface UseDataTableOptions {
  defaultSize?: number;
  defaultSort?: TableSort;
}

export interface UseDataTableReturn {
  page: Ref<number>;
  size: Ref<number>;
  searchWord: Ref<string>;
  filters: Ref<Record<string, unknown>>;
  sort: Ref<TableSort>;
  handleSearch: (val: string) => void;
  handleFilter: (newFilters: Record<string, unknown>) => void;
  handleSort: (newSort: TableSort) => void;
  tableProps: {
    sorting: { value: TableSort; onChange: (newSort: TableSort) => void };
    paginationProps: {
      currentPage: number;
      onPageChange: (p: number) => void;
      pageSize: number;
      onPageSizeChange: (s: number) => void;
    };
  };
}

export function useDataTable(options: UseDataTableOptions = {}): UseDataTableReturn {
  const { defaultSize = 25, defaultSort = {} as TableSort } = options;

  const page = ref(0);
  const size = ref(defaultSize);
  const searchWord = ref('');
  const filters = ref<Record<string, unknown>>({});
  const sort = ref<TableSort>(defaultSort);

  const handleSearch = (val: string): void => {
    searchWord.value = val;
    page.value = 0;
  };

  const handleFilter = (newFilters: Record<string, unknown>): void => {
    filters.value = newFilters;
    page.value = 0;
  };

  const handleSort = (newSort: TableSort): void => {
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
