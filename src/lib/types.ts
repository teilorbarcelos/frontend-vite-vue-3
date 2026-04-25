export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type SortDirection = 'asc' | 'desc' | undefined;

export interface TableSort {
  orderBy?: string;
  orderDirection?: SortDirection;
}
