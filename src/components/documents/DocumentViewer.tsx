/**
 * DocumentViewer Component
 * 
 * Displays a preview of documents (images and PDFs) in a modal.
 * Provides download functionality for all document types.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Database } from '@/types/database';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function DocumentViewer({
  document,
  isOpen,
  onClose,
  onDownload,
}: DocumentViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document || !isOpen) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get signed URL for viewing
        const response = await fetch(`/api/documents/${document.id}/view`);
        
        if (!response.ok) {
          throw new Error('Failed to load document preview');
        }

        const { url } = await response.json();
        setPreviewUrl(url);
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Failed to load document preview');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [document, isOpen]);

  if (!isOpen || !document) {
    return null;
  }

  const isImage = document.mime_type.startsWith('image/');
  const isPDF = document.mime_type === 'application/pdf';
  const canPreview = isImage || isPDF;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {document.file_name}
              </h3>
              <p className="text-sm text-gray-500">
                {document.mime_type} • {(document.file_size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin h-12 w-12 text-blue-600">
                  <svg fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <svg
                  className="h-16 w-16 text-red-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {!isLoading && !error && previewUrl && (
              <>
                {isImage && (
                  <div className="flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt={document.file_name}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {isPDF && (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] rounded-lg shadow-lg"
                    title={document.file_name}
                  />
                )}

                {!canPreview && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <svg
                      className="h-16 w-16 text-gray-400 mb-4"
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
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download File
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
