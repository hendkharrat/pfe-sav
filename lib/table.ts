export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'fr');
}

export function sortData<T>(
  data: T[],
  sortConfig: SortConfig | null,
  getSortValue: (item: T, key: string) => unknown
): T[] {
  if (!sortConfig) return data;
  const { key, direction } = sortConfig;
  return [...data].sort((a, b) => {
    const cmp = compareValues(getSortValue(a, key), getSortValue(b, key));
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

export function getPaginationInfo(
  totalItems: number,
  page: number,
  pageSize: number
): { from: number; to: number; totalPages: number } {
  if (totalItems === 0) return { from: 0, to: 0, totalPages: 0 };
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);
  return { from, to, totalPages };
}

export function toggleSort(current: SortConfig | null, key: string): SortConfig | null {
  if (current === null || current.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return null;
}
