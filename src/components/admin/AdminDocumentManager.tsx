/**
 * Admin Document Manager Component
 * 
 * Allows admin to manage document status (mark as corrupted or valid).
 * Provides bulk actions and filtering capabilities.
 * 
 * Requirements: 11.4
 */

'use client';

import { useState } from 'react';
import type { Database } from '@/types/database';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentStatus = Database['public']['Tables']['documents']['Row']['status'];

interface AdminDocumentManagerProps {
  documents: Document[];
  leadId?: string;
  onStatusChange?: () => void;
}

export function AdminDocumentManager({
  documents,
  leadId,
  onStatusChange,
}: AdminDocumentManagerProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');

  const filteredDocuments = documents.filter((doc) => {
    if (filterStatus === 'all') return true;
    return doc.status === filterStatus;
  });

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const handleSelectDocument = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleMarkStatus = async (status: 'corrupted' | 'valid', documentIds?: string[]) => {
    const idsToUpdate = documentIds || Array.from(selectedDocuments);

    if (idsToUpdate.length === 0) {
      setError('No documents selected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const endpoint = status === 'corrupted' ? 'corrupted' : 'valid';

      // Update each document
      const results = await Promise.allSettled(
        idsToUpdate.map((id) =>
          fetch(`/api/documents/${id}/${endpoint}`, {
            method: 'PATCH',
          })
        )
      );

      const failures = results.filter((r) => r.status === 'rejected').length;
      const successes = results.filter((r) => r.status === 'fulfilled').length;

      if (failures > 0) {
        setError(`${failures} document(s) failed to update`);
      }

      if (successes > 0) {
        setSuccess(
          `Successfully marked ${successes} document(s) as ${status}`
        );
        setSelectedDocuments(new Set());

        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      aadhar_front: 'Aadhar Front',
      aadhar_back: 'Aadhar Back',
      bijli_bill: 'Bijli Bill',
      bank_passbook: 'Bank Passbook',
      cancelled_cheque: 'Cancelled Cheque',
      pan_card: 'PAN Card',
      itr: 'ITR',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'corrupted':
        return 'bg-red-100 text-red-800';
      case 'replaced':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Admin Document Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage document status and trigger workflow actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="corrupted">Corrupted</option>
            <option value="replaced">Replaced</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedDocuments.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedDocuments.size} document(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkStatus('valid')}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Valid
              </button>
              <button
                onClick={() => handleMarkStatus('corrupted')}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Corrupted
              </button>
              <button
                onClick={() => setSelectedDocuments(new Set())}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No documents found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center px-4 py-2 bg-gray-50 rounded border border-gray-200">
            <input
              type="checkbox"
              checked={
                filteredDocuments.length > 0 &&
                selectedDocuments.size === filteredDocuments.length
              }
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Select All ({filteredDocuments.length})
            </label>
          </div>

          {/* Documents */}
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedDocuments.has(doc.id)}
                onChange={() => handleSelectDocument(doc.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {doc.file_name}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium">
                    {getCategoryLabel(doc.document_category)}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{doc.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.status !== 'valid' && (
                  <button
                    onClick={() => handleMarkStatus('valid', [doc.id])}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Valid
                  </button>
                )}
                {doc.status !== 'corrupted' && (
                  <button
                    onClick={() => handleMarkStatus('corrupted', [doc.id])}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Corrupted
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
