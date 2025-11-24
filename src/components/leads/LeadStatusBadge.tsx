/**
 * Lead Status Badge Component
 * 
 * Displays a visual indicator for lead status with appropriate colors.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import type { LeadStatus } from '@/types/database';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  ongoing: {
    label: 'Ongoing',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  interested: {
    label: 'Interested',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  not_interested: {
    label: 'Not Interested',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export function LeadStatusBadge({ status, className = '' }: LeadStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
