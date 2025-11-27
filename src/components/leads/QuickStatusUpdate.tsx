/**
 * Quick Status Update Component
 * Simple status change with comments for office team
 */

'use client';

import { useState } from 'react';
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
          <h3 className="text-sm font-medium text-gray-900">Current Status</h3>
          <div className="mt-1">
            <LeadStatusBadge status={currentStatus} />
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          Update Status
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => !isSubmitting && setIsOpen(false)}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Lead Status
              </h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Status
                  </label>
                  <div className="space-y-2">
                    {availableStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`w-full text-left px-4 py-3 border rounded-md ${
                          selectedStatus === status
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <LeadStatusBadge status={status} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                    Comments / Remarks
                  </label>
                  <textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder="Add any comments about this status change..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedStatus || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
