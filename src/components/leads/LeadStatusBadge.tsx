/**
 * Lead Status Badge Component
 * Displays a styled badge for lead status with user-friendly labels
 */

import type { LeadStatus } from '@/types/database';
import { getStatusLabel, getStatusColor } from '@/lib/utils/status-labels';
import { cn } from '@/lib/utils';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
  showDescription?: boolean;
}

export function LeadStatusBadge({ status, className, showDescription = false }: LeadStatusBadgeProps) {
  const label = getStatusLabel(status);
  const colors = getStatusColor(status);

  return (
    <span
      className={cn(
        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
        colors.badge,
        className
      )}
      title={showDescription ? undefined : label}
    >
      {label}
    </span>
  );
}
