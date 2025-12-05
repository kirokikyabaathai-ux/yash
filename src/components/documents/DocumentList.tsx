/**
 * DocumentList Component
 * 
 * Displays a list of documents for a lead with filtering and actions.
 * Shows document metadata, status, and provides download/delete options.
 * Uses shadcn/ui Card and Button components for consistent styling.
 */

'use client';

import React from 'react';
import { Database } from '@/types/database';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Download, AlertTriangle, Trash2, FileText } from 'lucide-react';

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
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium truncate">
                    {doc.file_name}
                  </h4>
                  <DocumentStatusBadge status={doc.status as any} />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span className="font-medium">{getCategoryLabel(doc.document_category)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {doc.uploaded_at ? formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true }) : 'N/A'}
                  </span>
                  <span className="sm:hidden">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Type: {doc.type}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-4 justify-end sm:justify-start flex-shrink-0">
                {onDownload && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onDownload(doc)}
                    title="View document"
                    aria-label={`View ${doc.file_name}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}

                {canManage && doc.status === 'valid' && onMarkCorrupted && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onMarkCorrupted(doc.id)}
                    title="Mark as corrupted"
                    aria-label={`Mark ${doc.file_name} as corrupted`}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                )}

                {canManage && onDelete && (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => onDelete(doc.id)}
                    title="Delete document"
                    aria-label={`Delete ${doc.file_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
