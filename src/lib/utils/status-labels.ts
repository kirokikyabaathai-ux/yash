/**
 * Status Label Utilities
 * Provides user-friendly labels and styling for lead statuses
 */

import type { LeadStatus } from '@/types/database';

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

export function getStatusLabel(status: LeadStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusDescription(status: LeadStatus): string {
  return STATUS_DESCRIPTIONS[status] || '';
}

export function getStatusColor(status: LeadStatus): { bg: string; text: string; badge: string } {
  return STATUS_COLORS[status] || STATUS_COLORS.lead;
}
