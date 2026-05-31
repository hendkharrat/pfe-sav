'use client';

import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { type SortConfig } from '@/lib/table';
import { cn } from '@/lib/utils';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = sortConfig !== null && sortConfig.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <TableHead className={cn('p-0', className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 h-12 w-full px-4 text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        {label}
        {direction === 'asc' ? (
          <ArrowUp size={13} className="shrink-0 text-foreground" />
        ) : direction === 'desc' ? (
          <ArrowDown size={13} className="shrink-0 text-foreground" />
        ) : (
          <ChevronsUpDown size={13} className="shrink-0 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
