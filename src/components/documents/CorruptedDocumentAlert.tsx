/**
 * CorruptedDocumentAlert Component
 * 
 * Displays an alert for corrupted documents with re-upload functionality.
 * Shows to users who uploaded the corrupted document.
 */

'use client';

import React from 'react';
import { Database } from '@/types/database';
import { DocumentUploader } from './DocumentUploader';

type Document = Database['public']['Tables']['documents']['Row'];

interface CorruptedDocumentAlertProps {
  document: Document;
  onReuploadComplete?: () => void;
  canReupload?: boolean;
}

export function CorruptedDocumentAlert({
  document,
  onReuploadComplete,
  canReupload = true,
}: CorruptedDocumentAlertProps) {
  const [showUploader, setShowUploader] = React.useState(false);

  const handleUploadComplete = (documentId: string) => {
    setShowUploader(false);
    if (onReuploadComplete) {
      onReuploadComplete();
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Document Corrupted
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              The document <strong>{document.file_name}</strong> has been marked as corrupted.
              {canReupload && ' Please upload a valid replacement document.'}
            </p>
          </div>
          {canReupload && (
            <div className="mt-4">
              {!showUploader ? (
                <button
                  onClick={() => setShowUploader(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Re-upload Document
                </button>
              ) : (
                <div className="mt-2">
                  <DocumentUploader
                    leadId={document.lead_id}
                    documentType={document.type}
                    documentCategory={document.document_category}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={(error) => {
                      console.error('Re-upload error:', error);
                    }}
                  />
                  <button
                    onClick={() => setShowUploader(false)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
