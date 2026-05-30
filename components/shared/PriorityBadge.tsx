'use client';

import { Badge } from '@/components/ui/badge';
import { INTERVENTION_PRIORITY_LABELS } from '@/lib/constants';

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const label = INTERVENTION_PRIORITY_LABELS[priority] || priority;

  const priorityColorMap: Record<string, string> = {
    FAIBLE: 'bg-blue-100 text-blue-800',
    MOYENNE: 'bg-yellow-100 text-yellow-800',
    ELEVEE: 'bg-orange-100 text-orange-800',
    URGENTE: 'bg-red-100 text-red-800',
  };

  const colorClass = priorityColorMap[priority] || 'bg-gray-100 text-gray-800';

  return <Badge className={`${colorClass}`}>{label}</Badge>;
}
