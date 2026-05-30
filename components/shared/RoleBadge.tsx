'use client';

import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/types';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const label = ROLE_LABELS[role] || role;

  const roleColorMap: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    technician: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800',
  };

  const colorClass = roleColorMap[role] || 'bg-gray-100 text-gray-800';

  return <Badge className={`${colorClass}`}>{label}</Badge>;
}
