export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}
