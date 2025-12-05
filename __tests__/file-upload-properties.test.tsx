/**
 * Property-Based Tests for File Upload Requirements
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for file upload components including progress indication,
 * drop zone feedback, uploaded document card display, and error messaging.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 4.6, 12.1, 12.2, 12.5**
 */

import fc from 'fast-check';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUpload } from '../src/components/forms/FileUpload';
import React from 'react';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('File Upload Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 17: File upload progress indication**
   * **Validates: Requirements 4.6**
   * 
   * For any file upload component, it should display a progress indicator
   * (progress bar or percentage) during upload.
   */
  describe('Property 17: File upload progress indication', () => {
    it('should display progress indicator during upload', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          async (label, fileName) => {
            let uploadResolve: () => void;
            const uploadPromise = new Promise<void>((resolve) => {
              uploadResolve = resolve;
            });

            const handleUpload = jest.fn(() => uploadPromise);

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            // Create a mock file
            const file = new File(['test content'], fileName, { type: 'application/pdf' });

            // Trigger file selection
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;
            expect(input).toBeInTheDocument();

            fireEvent.change(input, { target: { files: [file] } });

            // Wait for upload to start
            await waitFor(() => {
              expect(handleUpload).toHaveBeenCalledWith(file);
            });

            // Progress indicator should be visible during upload
            const progressContainer = container.querySelector('.animate-spin');
            expect(progressContainer).toBeInTheDocument();

            // Progress bar should be present
            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeInTheDocument();

            // Uploading text should be visible
            expect(container.textContent).toContain('Uploading');

            // Complete the upload
            uploadResolve!();
            await waitFor(() => {
              expect(progressContainer).not.toBeInTheDocument();
            }, { timeout: 2000 });
          }
        ),
        { numRuns: 10 } // Reduced runs for async tests
      );
    });

    it('should display percentage during upload', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          async (label) => {
            let uploadResolve: () => void;
            const uploadPromise = new Promise<void>((resolve) => {
              uploadResolve = resolve;
            });

            const handleUpload = jest.fn(() => uploadPromise);

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
              expect(handleUpload).toHaveBeenCalled();
            });

            // Percentage text should be visible
            await waitFor(() => {
              const text = container.textContent || '';
              expect(text).toMatch(/\d+%/);
            });

            uploadResolve!();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should show spinner icon during upload', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          async (label) => {
            let uploadResolve: () => void;
            const uploadPromise = new Promise<void>((resolve) => {
              uploadResolve = resolve;
            });

            const handleUpload = jest.fn(() => uploadPromise);

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
              expect(handleUpload).toHaveBeenCalled();
            });

            // Spinner should have animate-spin class
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
            expect(spinner?.tagName).toBe('svg');

            uploadResolve!();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 35: Upload drop zone feedback**
   * **Validates: Requirements 12.1**
   * 
   * For any document upload component, the drop zone should provide visual feedback
   * (border color change, background highlight) when a file is dragged over it.
   */
  describe('Property 35: Upload drop zone feedback', () => {
    it('should change border color when file is dragged over', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          (label) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const dropZone = container.querySelector('[role="button"]');
            expect(dropZone).toBeInTheDocument();

            // Get initial classes
            const initialClasses = dropZone?.className || '';
            expect(initialClasses).toContain('border-dashed');

            // Simulate drag enter
            fireEvent.dragEnter(dropZone!, { dataTransfer: { files: [] } });

            // Border should change to primary color
            const dragClasses = dropZone?.className || '';
            expect(dragClasses).toContain('border-primary');
          }
        )
      );
    });

    it('should highlight background when file is dragged over', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          (label) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const dropZone = container.querySelector('[role="button"]');
            expect(dropZone).toBeInTheDocument();

            // Simulate drag enter
            fireEvent.dragEnter(dropZone!, { dataTransfer: { files: [] } });

            // Background should be highlighted
            const dragClasses = dropZone?.className || '';
            expect(dragClasses).toContain('bg-primary/5');
          }
        )
      );
    });

    it('should update text when file is dragged over', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          (label) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const dropZone = container.querySelector('[role="button"]');
            expect(dropZone).toBeInTheDocument();

            // Initial text
            expect(container.textContent).toContain('Click to upload or drag and drop');

            // Simulate drag enter
            fireEvent.dragEnter(dropZone!, { dataTransfer: { files: [] } });

            // Text should change
            expect(container.textContent).toContain('Drop file here');
          }
        )
      );
    });

    it('should remove feedback when drag leaves', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          (label) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const dropZone = container.querySelector('[role="button"]');
            expect(dropZone).toBeInTheDocument();

            // Simulate drag enter then leave
            fireEvent.dragEnter(dropZone!, { dataTransfer: { files: [] } });
            fireEvent.dragLeave(dropZone!, { dataTransfer: { files: [] } });

            // Should return to normal state
            const finalClasses = dropZone?.className || '';
            expect(finalClasses).not.toContain('border-primary');
            expect(finalClasses).not.toContain('bg-primary/5');
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 36: Uploaded document card display**
   * **Validates: Requirements 12.2**
   * 
   * For any uploaded document, it should display in a card layout showing the file name,
   * upload status, and action buttons (view, delete).
   */
  describe('Property 36: Uploaded document card display', () => {
    it('should display uploaded file in card layout', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          (label, fileName, fileId) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                  url: 'https://example.com/file.pdf',
                }}
              />
            );

            // Card should be present
            const card = container.querySelector('[class*="card"]');
            expect(card).toBeInTheDocument();

            // File name should be displayed
            expect(container.textContent).toContain(fileName);
          }
        )
      );
    });

    it('should display file name in uploaded document card', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          (fileName, fileId) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                }}
              />
            );

            // File name should be visible and truncated if needed
            const fileNameElement = container.querySelector('.truncate');
            expect(fileNameElement).toBeInTheDocument();
            expect(fileNameElement?.textContent).toBe(fileName);
          }
        )
      );
    });

    it('should display view button for uploaded documents with URL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.webUrl(),
          (fileName, fileId, fileUrl) => {
            const handleUpload = jest.fn();
            const handleView = jest.fn();

            const { container } = render(
              <FileUpload
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                  url: fileUrl,
                }}
                onView={handleView}
              />
            );

            // View button should be present
            const viewButton = Array.from(container.querySelectorAll('button')).find(
              btn => btn.textContent?.includes('View')
            );
            expect(viewButton).toBeInTheDocument();
            expect(viewButton).toHaveAttribute('aria-label', `View ${fileName}`);
          }
        )
      );
    });

    it('should display delete button for uploaded documents', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          (fileName, fileId) => {
            const handleUpload = jest.fn();
            const handleDelete = jest.fn();

            const { container } = render(
              <FileUpload
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                }}
                onDelete={handleDelete}
              />
            );

            // Delete button should be present
            const deleteButton = Array.from(container.querySelectorAll('button')).find(
              btn => btn.textContent?.includes('Delete')
            );
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).toHaveAttribute('aria-label', `Delete ${fileName}`);
            expect(deleteButton).toHaveClass('destructive');
          }
        )
      );
    });

    it('should display file icon in uploaded document card', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          (fileName, fileId) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                }}
              />
            );

            // File icon should be present
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
          }
        )
      );
    });

    it('should display file size when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9._-]+\.(pdf|jpg|png)$/.test(s)),
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.integer({ min: 1024, max: 10485760 }), // 1KB to 10MB
          (fileName, fileId, fileSize) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                onUpload={handleUpload}
                uploadedFile={{
                  id: fileId,
                  name: fileName,
                  size: fileSize,
                }}
              />
            );

            // File size should be displayed in human-readable format
            const text = container.textContent || '';
            expect(text).toMatch(/\d+(\.\d+)?\s*(B|KB|MB)/);
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 37: Upload error messaging**
   * **Validates: Requirements 12.5**
   * 
   * For any failed document upload, it should display a clear error message
   * with the reason for failure.
   */
  describe('Property 37: Upload error messaging', () => {
    it('should display error message when upload fails', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          async (label, errorMessage) => {
            const handleUpload = jest.fn().mockRejectedValue(new Error(errorMessage));

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [file] } });

            // Wait for error to appear
            await waitFor(() => {
              const errorElement = container.querySelector('.text-destructive');
              expect(errorElement).toBeInTheDocument();
              expect(errorElement?.textContent).toContain(errorMessage);
            });
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error icon with error message', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          async (label, errorMessage) => {
            const handleUpload = jest.fn().mockRejectedValue(new Error(errorMessage));

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
              />
            );

            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [file] } });

            await waitFor(() => {
              const errorElement = container.querySelector('.text-destructive');
              expect(errorElement).toBeInTheDocument();
              
              // Error icon should be present
              const icon = errorElement?.querySelector('svg');
              expect(icon).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error for file size exceeding limit', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 5 }), // Max size in MB
          fc.integer({ min: 6, max: 20 }), // File size in MB (exceeds limit)
          (label, maxSizeMB, fileSizeMB) => {
            const handleUpload = jest.fn();
            const maxSize = maxSizeMB * 1024 * 1024;
            const fileSize = fileSizeMB * 1024 * 1024;

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
                maxSize={maxSize}
              />
            );

            const file = new File(['x'.repeat(fileSize)], 'large.pdf', { type: 'application/pdf' });
            Object.defineProperty(file, 'size', { value: fileSize });

            const input = container.querySelector('input[type="file"]') as HTMLInputElement;
            fireEvent.change(input, { target: { files: [file] } });

            // Error message should indicate size limit
            const errorElement = container.querySelector('.text-destructive');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement?.textContent).toMatch(/size.*exceeds.*limit/i);
            expect(errorElement?.textContent).toContain(`${maxSizeMB}`);
          }
        )
      );
    });

    it('should display error for invalid file type', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.constantFrom('.pdf', '.jpg', '.png', 'image/*'),
          fc.constantFrom('test.txt', 'test.doc', 'test.exe'),
          (label, acceptedType, invalidFileName) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
                accept={acceptedType}
              />
            );

            const file = new File(['test'], invalidFileName, { type: 'text/plain' });
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;
            fireEvent.change(input, { target: { files: [file] } });

            // Error message should indicate file type not accepted
            const errorElement = container.querySelector('.text-destructive');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement?.textContent).toMatch(/file type.*not accepted/i);
          }
        )
      );
    });

    it('should display external error prop', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          (label, errorMessage) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
                error={errorMessage}
              />
            );

            // External error should be displayed
            const errorElement = container.querySelector('.text-destructive');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement?.textContent).toContain(errorMessage);
          }
        )
      );
    });

    it('should apply error styling to drop zone border', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          (label, errorMessage) => {
            const handleUpload = jest.fn();

            const { container } = render(
              <FileUpload
                label={label}
                onUpload={handleUpload}
                error={errorMessage}
              />
            );

            // Drop zone should have error border
            const dropZone = container.querySelector('[role="button"]');
            expect(dropZone).toBeInTheDocument();
            expect(dropZone?.className).toContain('border-destructive');
          }
        )
      );
    });
  });
});
