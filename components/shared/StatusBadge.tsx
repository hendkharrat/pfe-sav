'use client';

import { Badge } from '@/components/ui/badge';
import {
  INTERVENTION_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  PANNE_STATUS_LABELS,
} from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'intervention' | 'contract' | 'invoice' | 'panne';
}

export function StatusBadge({ status, type = 'intervention' }: StatusBadgeProps) {
  const statusLabels = {
    intervention: INTERVENTION_STATUS_LABELS,
    contract: CONTRACT_STATUS_LABELS,
    invoice: INVOICE_STATUS_LABELS,
    panne: PANNE_STATUS_LABELS,
  };

  const labels = statusLabels[type];
  const label = labels[status] || status;

  const statusColorMap: Record<string, string> = {
    PLANIFIEE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    EN_COURS: 'bg-blue-100 text-blue-800 border-blue-200',
    REALISEE: 'bg-green-100 text-green-800 border-green-200',
    ANNULEE: 'bg-gray-100 text-gray-800 border-gray-200',
    ACTIF: 'bg-green-100 text-green-800 border-green-200',
    EXPIRE: 'bg-red-100 text-red-800 border-red-200',
    BIENTOT_EXPIRE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    EN_SERVICE: 'bg-green-100 text-green-800 border-green-200',
    EN_PANNE: 'bg-red-100 text-red-800 border-red-200',
    HORS_SERVICE: 'bg-gray-100 text-gray-800 border-gray-200',
    PAYEE: 'bg-green-100 text-green-800 border-green-200',
    IMPAYEE: 'bg-red-100 text-red-800 border-red-200',
    EN_ATTENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PRISE_EN_CHARGE: 'bg-purple-100 text-purple-800 border-purple-200',
    CONVERTIE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const colorClass = statusColorMap[status] || 'bg-gray-100 text-gray-800';

  return <Badge variant="outline" className={`${colorClass} font-medium`}>{label}</Badge>;
}

