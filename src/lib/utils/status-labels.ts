/**
 * Status Label Utilities
 * Provides user-friendly labels and styling for lead statuses
 */

import type { LeadStatus } from '@/types/database';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  lead: 'Lead',
  lead_interested: 'Lead Interested',
  lead_processing: 'Lead Processing',
  lead_completed: 'Lead Completed',
  lead_cancelled: 'Lead Cancelled',
};

export const STATUS_DESCRIPTIONS: Record<LeadStatus, string> = {
  lead: 'Initial contact, agent found the person',
  lead_interested: 'Customer agreed to proceed',
  lead_processing: 'Form filled + active project (timeline updates)',
  lead_completed: 'Project finished',
  lead_cancelled: 'Customer declined/withdrew',
};

// Legacy color mapping for backward compatibility
export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; badge: string }> = {
  lead: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
  },
  lead_interested: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  lead_processing: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  lead_completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
  },
  lead_cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
  },
};

// shadcn/ui Badge variant mapping with custom colors for status indicators
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const STATUS_VARIANTS: Record<
  LeadStatus,
  { variant: BadgeVariant; className: string }
> = {
  lead: {
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  lead_interested: {
    variant: 'outline',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
  },
  lead_processing: {
    variant: 'outline',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  },
  lead_completed: {
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  },
  lead_cancelled: {
    variant: 'destructive',
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
};

export function getStatusLabel(status: LeadStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusDescription(status: LeadStatus): string {
  return STATUS_DESCRIPTIONS[status] || '';
}

export function getStatusColor(status: LeadStatus): { bg: string; text: string; badge: string } {
  return STATUS_COLORS[status] || STATUS_COLORS.lead;
}

export function getStatusVariant(status: LeadStatus): { variant: BadgeVariant; className: string } {
  return STATUS_VARIANTS[status] || STATUS_VARIANTS.lead;
}
