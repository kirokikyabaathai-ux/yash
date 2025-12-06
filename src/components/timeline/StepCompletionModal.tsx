/**
 * Step Completion Modal Component
 * 
 * Modal for completing timeline steps with remarks and attachments.
 * Uses shadcn/ui Dialog component for consistent modal behavior.
 * 
 * Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TimelineStepData } from './TimelineStep';
import { useRouter } from 'next/navigation';

interface StepCompletionModalProps {
  step: TimelineStepData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { remarks?: string; attachments?: string[] }) => Promise<void>;
  isLoading?: boolean;
  leadInstallerId?: string | null;
  leadId?: string;
}

interface DocumentStatus {
  category: string;
  submitted: boolean;
  label: string;
  submission_type?: 'form' | 'file';
}

export function StepCompletionModal({
  step,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  leadInstallerId,
  leadId,
}: StepCompletionModalProps) {
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const router = useRouter();

  // Fetch document statuses when modal opens
  useEffect(() => {
    if (isOpen && leadId && step.step_documents && step.step_documents.length > 0) {
      fetchDocumentStatuses();
    }
  }, [isOpen, leadId, step.step_documents]);

  const fetchDocumentStatuses = async () => {
    if (!leadId || !step.step_documents || step.step_documents.length === 0) return;

    setLoadingDocs(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/documents`);
      if (response.ok) {
        const documents = await response.json();
        // documents is an array directly, not wrapped in { documents: [] }
        const submittedCategories = (Array.isArray(documents) ? documents : [])
          .filter((doc: any) => doc.is_submitted && doc.status === 'valid')
          .map((doc: any) => doc.document_category);

        const statuses = step.step_documents!.map(doc => ({
          category: doc.document_category,
          submitted: submittedCategories.includes(doc.document_category),
          submission_type: doc.submission_type,
          label: doc.document_category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
        }));

        setDocumentStatuses(statuses);
      }
    } catch (error) {
      console.error('Error fetching document statuses:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step.remarks_required && !remarks.trim()) {
      newErrors.remarks = 'Remarks are required for this step';
    }

    // Check if installer assignment is required
    if (step.requires_installer_assignment && !leadInstallerId) {
      return false;
    }

    // Check if all required documents are submitted
    const missingDocs = documentStatuses.filter(doc => !doc.submitted);
    if (missingDocs.length > 0) {
      newErrors.documents = `Missing required documents: ${missingDocs.map(d => d.label).join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: { remarks?: string; attachments?: string[] } = {};
    if (remarks.trim()) {
      data.remarks = remarks.trim();
    }

    await onSubmit(data);
    setRemarks('');
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      setRemarks('');
      setErrors({});
      setDocumentStatuses([]);
      onClose();
    }
  };

  // Form submission handlers
  const handleFillForm = (category: string) => {
    if (!leadId) return;
    
    // Route based on category
    switch (category) {
      case 'profile':
        router.push(`/customer/profile/new?leadId=${leadId}`);
        break;
      case 'quotation':
        router.push(`/forms/quotation/new?leadId=${leadId}`);
        break;
      case 'cash_memo':
        // TODO: Add cash memo form route
        alert('Cash Memo form not yet implemented');
        break;
      case 'ppa':
        // TODO: Add PPA form route
        alert('PPA form not yet implemented');
        break;
      case 'vendor_agreement':
        // TODO: Add vendor agreement form route
        alert('Vendor Agreement form not yet implemented');
        break;
      default:
        alert(`Form for ${category} not yet implemented`);
    }
  };

  const handleViewForm = async (category: string) => {
    if (!leadId) return;

    try {
      const response = await fetch(`/api/leads/${leadId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch document');

      const documents = await response.json();
      // documents is an array directly
      const doc = (Array.isArray(documents) ? documents : []).find(
        (d: any) => d.document_category === category && d.is_submitted
      );

      if (!doc?.id) {
        alert('No data found for ' + category);
        return;
      }

      // Route based on category
      switch (category) {
        case 'profile':
          router.push(`/customer/profile/${doc.id}`);
          break;
        case 'quotation':
          router.push(`/forms/quotation/${doc.id}`);
          break;
        case 'cash_memo':
          // TODO: Add cash memo view route
          alert('Cash Memo view not yet implemented');
          break;
        case 'ppa':
          // TODO: Add PPA view route
          alert('PPA view not yet implemented');
          break;
        case 'vendor_agreement':
          // TODO: Add vendor agreement view route
          alert('Vendor Agreement view not yet implemented');
          break;
        default:
          // For unimplemented forms, show the raw JSON data
          if (doc.form_json) {
            const formattedData = JSON.stringify(doc.form_json, null, 2);
            alert(`${category} Data:\n\n${formattedData}`);
          } else {
            alert(`View for ${category} not yet implemented`);
          }
      }
    } catch (error) {
      console.error('Error viewing form:', error);
      alert('Failed to view form');
    }
  };

  // File submission handlers
  const handleUploadFile = (category: string) => {
    if (!leadId) return;
    
    // Create a file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('leadId', leadId);
        formData.append('documentCategory', category);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        // Refresh document statuses
        await fetchDocumentStatuses();
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      }
    };
    input.click();
  };

  const handleViewFile = async (category: string) => {
    if (!leadId) return;

    try {
      const response = await fetch(`/api/leads/${leadId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch document');

      const documents = await response.json();
      // documents is an array directly
      const doc = (Array.isArray(documents) ? documents : []).find(
        (d: any) => d.document_category === category && d.is_submitted
      );

      if (doc?.id) {
        // Open document view
        const viewResponse = await fetch(`/api/documents/view?documentId=${doc.id}`);
        if (!viewResponse.ok) throw new Error('Failed to get view URL');

        const { url } = await viewResponse.json();
        window.open(url, '_blank');
      } else {
        alert('No file found for ' + category);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file');
    }
  };

  const handleDeleteDocument = async (category: string) => {
    if (!leadId) return;
    
    if (!confirm(`Are you sure you want to delete this ${category}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Get document ID first
      const response = await fetch(`/api/leads/${leadId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch document');

      const documents = await response.json();
      // documents is an array directly
      const doc = (Array.isArray(documents) ? documents : []).find(
        (d: any) => d.document_category === category && d.is_submitted
      );

      if (!doc?.id) {
        alert('Document not found for ' + category);
        return;
      }

      // Delete document using the generic document endpoint
      const deleteResponse = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) throw new Error('Failed to delete document');

      // Refresh document statuses
      await fetchDocumentStatuses();
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <DialogTitle>Complete Step: {step.step_name}</DialogTitle>
              <DialogDescription>
                Mark this step as completed. {step.remarks_required && 'Remarks are required.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Installer Assignment Warning */}
          {step.requires_installer_assignment && !leadInstallerId && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Installer Assignment Required
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                    This step requires an installer to be assigned to the lead before it can be completed.
                    {leadId && (
                      <span className="block mt-2">
                        Please assign an installer in the lead details section first.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Installer Assignment Success */}
          {step.requires_installer_assignment && leadInstallerId && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-400">
                  <strong>Installer assigned:</strong> Ready to complete this step
                </p>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">
              Remarks {step.remarks_required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (errors.remarks) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.remarks;
                    return newErrors;
                  });
                }
              }}
              disabled={isLoading}
              rows={4}
              placeholder="Enter any notes or comments about this step..."
              className={errors.remarks ? 'border-destructive' : ''}
            />
            {errors.remarks && (
              <p className="text-sm text-destructive">{errors.remarks}</p>
            )}
          </div>

          {/* Required Documents */}
          {step.step_documents && step.step_documents.length > 0 && (
            <div className="space-y-2">
              <Label>Required Documents</Label>
              <div className="rounded-md border border-border bg-muted/50 p-4">
                {loadingDocs ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Checking documents...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      The following documents are required for this step:
                    </p>
                    <ul className="space-y-2">
                      {documentStatuses.map((docStatus) => (
                        <li key={docStatus.category} className="flex items-center gap-2 text-sm">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            docStatus.submitted 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {docStatus.submitted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <span className={`font-medium ${
                                docStatus.submitted 
                                  ? 'text-foreground' 
                                  : 'text-destructive'
                              }`}>
                                {docStatus.label}
                              </span>
                              <span className={`ml-2 text-xs ${
                                docStatus.submitted 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {docStatus.submitted ? '✓ Submitted' : '✗ Not submitted'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {docStatus.submission_type === 'form' ? (
                                // Form submission type
                                !docStatus.submitted ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFillForm(docStatus.category)}
                                    disabled={isLoading}
                                  >
                                    Fill Form
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewForm(docStatus.category)}
                                      disabled={isLoading}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteDocument(docStatus.category)}
                                      disabled={isLoading}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      Delete
                                    </Button>
                                  </>
                                )
                              ) : (
                                // File submission type
                                !docStatus.submitted ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUploadFile(docStatus.category)}
                                    disabled={isLoading}
                                  >
                                    Upload File
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewFile(docStatus.category)}
                                      disabled={isLoading}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteDocument(docStatus.category)}
                                      disabled={isLoading}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      Delete
                                    </Button>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {documentStatuses.some(doc => !doc.submitted) && (
                      <div className="mt-3 pt-3 border-t rounded-md bg-destructive/10 border border-destructive/20 p-3">
                        <p className="text-sm text-destructive font-medium">
                          ⚠ You must upload and submit all required documents before completing this step.
                        </p>
                      </div>
                    )}
                    {documentStatuses.every(doc => doc.submitted) && (
                      <div className="mt-3 pt-3 border-t rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                        <p className="text-sm text-green-800 dark:text-green-400 font-medium">
                          ✓ All required documents have been submitted
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {errors.documents && (
                <p className="text-sm text-destructive">{errors.documents}</p>
              )}
            </div>
          )}

          {/* Attachments Info */}
          {step.attachments_allowed && (
            <div className="rounded-md bg-primary/10 border border-primary/20 p-3">
              <p className="text-sm text-primary">
                <strong>Note:</strong> Attachments can be uploaded separately through the
                document management section.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
