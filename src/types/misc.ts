export interface QueryParams {
  page: number;
  sortOrder: "asc" | "desc";
  sortField: string;
  query?: string;
}
