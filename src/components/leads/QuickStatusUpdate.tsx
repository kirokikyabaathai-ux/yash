/**
 * Quick Status Update Component
 * Simple status change with comments for office team.
 * Uses shadcn/ui Dialog for consistent modal behavior.
 * 
 * Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LeadStatusBadge } from './LeadStatusBadge';
import type { LeadStatus } from '@/types/database';

interface QuickStatusUpdateProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: () => void;
}

// Manual status transitions allowed
// Note: lead_interested → lead_processing is automatic (when customer form is filled)
const STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  lead: ['lead_interested', 'lead_cancelled'],
  lead_interested: ['lead_cancelled'], // lead_processing is automatic
  lead_processing: ['lead_completed', 'lead_cancelled'],
  lead_completed: [],
  lead_cancelled: [],
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  lead: 'Lead',
  lead_interested: 'Lead Interested',
  lead_processing: 'Lead Processing',
  lead_completed: 'Lead Completed',
  lead_cancelled: 'Lead Cancelled',
};

export function QuickStatusUpdate({
  leadId,
  currentStatus,
  onStatusChange,
}: QuickStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          remarks: remarks.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to update status');
      }

      setIsOpen(false);
      setSelectedStatus(null);
      setRemarks('');
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableStatuses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-sm text-gray-600">
          No status updates available. Project is {STATUS_LABELS[currentStatus]}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Current Status</h3>
          <div className="mt-1">
            <LeadStatusBadge status={currentStatus} />
          </div>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          Update Status
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && setIsOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Select a new status and add any relevant comments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select New Status</Label>
              <div className="space-y-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                      selectedStatus === status
                        ? 'border-primary bg-primary/10'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <LeadStatusBadge status={status} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Comments / Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Add any comments about this status change..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
