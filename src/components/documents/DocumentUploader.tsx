/**
 * DocumentUploader Component
 * 
 * Provides drag-and-drop file upload functionality with progress tracking.
 * Supports multiple file types and validates file size.
 * Uses enhanced FileUpload component with shadcn/ui components.
 */

'use client';

import React, { useState } from 'react';
import { DocumentType } from '@/types/database';
import { FileUpload } from '@/components/forms/FileUpload';

interface DocumentUploaderProps {
  leadId: string;
  documentType: DocumentType;
  documentCategory: string;
  label?: string;
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

export function DocumentUploader({
  leadId,
  documentType,
  documentCategory,
  label,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 9,
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  disabled = false,
}: DocumentUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);

    try {
      // Step 1: Get signed upload URL
      const urlResponse = await fetch(`/api/leads/${leadId}/documents/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          documentType,
          documentCategory,
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error?.message || 'Failed to get upload URL');
      }

      const { uploadUrl, filePath, documentId } = await urlResponse.json();

      // Step 2: Upload file to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Step 3: Record document metadata
      const metadataResponse = await fetch(`/api/leads/${leadId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          type: documentType,
          document_category: documentCategory,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        }),
      });

      if (!metadataResponse.ok) {
        const error = await metadataResponse.json();
        throw new Error(error.error?.message || 'Failed to save document metadata');
      }

      const { document } = await metadataResponse.json();

      // Success
      if (onUploadComplete) {
        onUploadComplete(document.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      throw error; // Re-throw to let FileUpload component handle it
    }
  };

  return (
    <FileUpload
      label={label}
      accept={acceptedFileTypes.join(',')}
      maxSize={maxSizeMB * 1024 * 1024}
      onUpload={handleUpload}
      error={error || undefined}
      disabled={disabled}
    />
  );
}
