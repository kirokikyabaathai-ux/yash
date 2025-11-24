/**
 * DocumentList Component
 * 
 * Displays a list of documents for a lead with filtering and actions.
 * Shows document metadata, status, and provides download/delete options.
 */

'use client';

import React from 'react';
import { Database } from '@/types/database';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { formatDistanceToNow } from 'date-fns';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentListProps {
  documents: Document[];
  onDownload?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onMarkCorrupted?: (documentId: string) => void;
  canManage?: boolean;
  isLoading?: boolean;
}

export function DocumentList({
  documents,
  onDownload,
  onDelete,
  onMarkCorrupted,
  canManage = false,
  isLoading = false,
}: DocumentListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
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
        <p className="mt-2 text-sm text-gray-600">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {doc.file_name}
                </h4>
                <DocumentStatusBadge status={doc.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                <span className="font-medium">{getCategoryLabel(doc.document_category)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{formatFileSize(doc.file_size)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}</span>
                <span className="sm:hidden">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Type: {doc.type}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-4 justify-end sm:justify-start">
              {onDownload && (
                <button
                  onClick={() => onDownload(doc)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors touch-manipulation"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              )}

              {canManage && doc.status === 'valid' && onMarkCorrupted && (
                <button
                  onClick={() => onMarkCorrupted(doc.id)}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors touch-manipulation"
                  title="Mark as Corrupted"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </button>
              )}

              {canManage && onDelete && (
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors touch-manipulation"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
