/**
 * Lead Status Badge Component
 * Displays a styled badge for lead status with user-friendly labels
 * Uses shadcn/ui Badge component for consistent styling
 */

import type { LeadStatus } from '@/types/database';
import { getStatusLabel, getStatusVariant } from '@/lib/utils/status-labels';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
  showDescription?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function LeadStatusBadge({ 
  status, 
  className, 
  showDescription = false,
  size = 'default'
}: LeadStatusBadgeProps) {
  const label = getStatusLabel(status);
  const variant = getStatusVariant(status);

  return (
    <Badge
      variant={variant.variant}
      className={cn(
        variant.className,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
      title={showDescription ? undefined : label}
    >
      {label}
    </Badge>
  );
}
