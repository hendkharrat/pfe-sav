import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationInfo } from '@/lib/table';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPrevious,
  onNext,
}: TablePaginationProps) {
  const { from, to, totalPages } = getPaginationInfo(totalItems, page, pageSize);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
      <p className="text-muted-foreground">
        Affichage de {from} à {to} sur {totalItems} résultat{totalItems !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1}
          className="gap-1"
        >
          <ChevronLeft size={15} />
          Précédent
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          className="gap-1"
        >
          Suivant
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
