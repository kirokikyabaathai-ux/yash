/**
 * DocumentStatusBadge Component
 * 
 * Displays a visual badge indicating the status of a document.
 * Supports three statuses: valid, corrupted, and replaced.
 */

import React from 'react';
import { DocumentStatus } from '@/types/database';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className = '' }: DocumentStatusBadgeProps) {
  const statusConfig = {
    valid: {
      label: 'Valid',
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    corrupted: {
      label: 'Corrupted',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    replaced: {
      label: 'Replaced',
      className: 'bg-muted text-muted-foreground border-border',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
