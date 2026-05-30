'use client';

import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-muted-foreground mb-4">
        {icon || <AlertCircle size={48} className="opacity-50" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
}
