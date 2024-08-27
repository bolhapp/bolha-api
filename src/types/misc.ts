export type SortOrder = "asc" | "desc";

export interface QueryParams {
  page: number;
  sortOrder: SortOrder;
  sortField: string;
  query?: string;
}
