/**
 * Lead Detail Component
 * 
 * Displays complete information for a single lead.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

'use client';

import { useState } from 'react';
import type { Lead } from '@/types/api';
import { LeadStatusBadge } from './LeadStatusBadge';

interface LeadDetailProps {
  lead: Lead;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function LeadDetail({
  lead,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: LeadDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.customer_name}</h2>
            <div className="mt-2">
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Contact Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{lead.phone}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{lead.email || 'Not provided'}</dd>
          </div>

          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{lead.address}</dd>
          </div>

          {/* Project Details */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{lead.source}</dd>
          </div>

          {lead.notes && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{lead.notes}</dd>
            </div>
          )}

          {/* Metadata */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(lead.created_at)}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(lead.updated_at)}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Lead ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{lead.id}</dd>
          </div>
        </dl>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone and will also
              delete all associated documents, timeline steps, and activity logs.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
