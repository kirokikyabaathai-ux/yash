/**
 * DocumentViewer Component
 * 
 * Displays a preview of documents (images and PDFs) in a modal.
 * Provides download functionality for all document types.
 * Uses shadcn/ui Dialog for consistent modal behavior.
 * 
 * Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Download, FileText, AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

  if (!document) {
    return null;
  }

  const isImage = document.mime_type.startsWith('image/');
  const isPDF = document.mime_type === 'application/pdf';
  const canPreview = isImage || isPDF;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{document.file_name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {document.mime_type} • {(document.file_size / 1024).toFixed(2)} KB
              </p>
            </div>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="flex-shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
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
                  className="w-full h-[70vh] rounded-lg shadow-lg border"
                  title={document.file_name}
                />
              )}

              {!canPreview && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                  {onDownload && (
                    <Button onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
