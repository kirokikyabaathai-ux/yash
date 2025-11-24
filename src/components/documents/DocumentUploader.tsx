/**
 * DocumentUploader Component
 * 
 * Provides drag-and-drop file upload functionality with progress tracking.
 * Supports multiple file types and validates file size.
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { DocumentType } from '@/types/database';

interface DocumentUploaderProps {
  leadId: string;
  documentType: DocumentType;
  documentCategory: string;
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
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  disabled = false,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isAccepted = acceptedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return mimeType.startsWith(category + '/');
      }
      return type === fileExtension || type === mimeType;
    });

    if (!isAccepted) {
      return 'File type not supported';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

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

      setUploadProgress(100);

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
      setSelectedFile(null);
      if (onUploadComplete) {
        onUploadComplete(document.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      if (onUploadError) {
        onUploadError(error);
      }
      return;
    }

    setSelectedFile(file);
    uploadFile(file);
  }, [leadId, documentType, documentCategory]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Detect if device has camera capability
  const isMobileDevice = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedFileTypes.join(',')}
          capture={isMobileDevice ? 'environment' : undefined}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin mx-auto h-10 sm:h-12 w-10 sm:w-12 text-blue-600">
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
            <p className="text-sm text-gray-600 break-words px-2">Uploading {selectedFile?.name}...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">
                  {isMobileDevice ? 'Tap to capture or upload' : 'Click to upload'}
                </span>
                {!isMobileDevice && <span> or drag and drop</span>}
              </p>
              {isMobileDevice && (
                <p className="text-xs text-gray-500">
                  Take a photo or choose from gallery
                </p>
              )}
              <p className="text-xs text-gray-500">
                Max file size: {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
