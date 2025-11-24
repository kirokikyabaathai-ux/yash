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
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    corrupted: {
      label: 'Corrupted',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    replaced: {
      label: 'Replaced',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
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
