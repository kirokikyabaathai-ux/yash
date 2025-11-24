/**
 * InstallationPhotoUploader Component
 * 
 * Allows installers to upload installation photos.
 * Stores files under leads/{lead_id}/installation/ path.
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';

interface InstallationPhotoUploaderProps {
  leadId: string;
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function InstallationPhotoUploader({
  leadId,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  disabled = false,
}: InstallationPhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accept only image files for installation photos
  const acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type - only images allowed
    if (!acceptedFileTypes.includes(file.type)) {
      return 'Only image files (JPEG, PNG, WebP) are supported';
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
          documentType: 'installation',
          documentCategory: 'installation_photo',
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error?.message || 'Failed to get upload URL');
      }

      const { uploadUrl, filePath, documentId } = await urlResponse.json();

      // Verify the path structure is correct: leads/{lead_id}/installation/
      if (!filePath.includes(`leads/${leadId}/installation/`)) {
        throw new Error('Invalid file path structure');
      }

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
          type: 'installation',
          document_category: 'installation_photo',
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
  }, [leadId]);

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

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedFileTypes.join(',')}
          disabled={disabled || isUploading}
          className="hidden"
          capture="environment"
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin mx-auto h-12 w-12 text-green-600">
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
            <p className="text-sm text-gray-600">Uploading {selectedFile?.name}...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-green-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Installation photos only (JPEG, PNG, WebP)
            </p>
            <p className="text-xs text-gray-500">
              Max file size: {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
