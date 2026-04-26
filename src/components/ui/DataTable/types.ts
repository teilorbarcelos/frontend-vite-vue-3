/* v8 ignore start */
import type { TableSort, SortDirection } from '@/lib/types';
export type { TableSort, SortDirection };

export interface HeaderMapItem<T> {
  title: string;
  keyItem: string;
  sortable?: boolean;
  truncate?: boolean;
  parseItem?: (value: unknown, item: T) => unknown;
}

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export interface DataTableProps<T> {
  data: T[];
  headerMap: HeaderMapItem<T>[];
  isLoading?: boolean;
  totalItems?: number;
  paginationProps?: PaginationProps;
  sorting?: {
    value: {
      orderBy?: string;
      orderDirection?: SortDirection;
    };
    onChange: (sort: { orderBy?: string; orderDirection?: SortDirection }) => void;
  };
  class?: string;
}

export interface DataTableWithPaginationProps<T> {
  data: T[];
  headerMap: HeaderMapItem<T>[];
  pageSize?: number;
  class?: string;
}
