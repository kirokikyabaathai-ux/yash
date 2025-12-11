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
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface StepCompletionModalProps {
  step: TimelineStepData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { remarks?: string; attachments?: string[] }) => Promise<void>;
  onHalt?: (data: { remarks?: string }) => Promise<void>;
  onSkip?: (data: { remarks?: string }) => Promise<void>;
  isLoading?: boolean;
  leadInstallerId?: string | null;
  leadId?: string;
  userRole?: string;
}

interface DocumentStatus {
  category: string;
  submitted: boolean;
  label: string;
  submission_type?: 'form' | 'file';
  process_type?: 'submission' | 'verification';
  documentId?: string; // Cache the document ID
}

export function StepCompletionModal({
  step,
  isOpen,
  onClose,
  onSubmit,
  onHalt,
  onSkip,
  isLoading = false,
  leadInstallerId,
  leadId,
  userRole,
}: StepCompletionModalProps) {
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
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
        // documents is an array directly
        const docsArray = Array.isArray(documents) ? documents : [];
        
        // Create a map of submitted documents with their IDs
        const docMap = new Map(
          docsArray
            .filter((doc: any) => doc.is_submitted && doc.status === 'valid')
            .map((doc: any) => [doc.document_category, doc.id])
        );

        const statuses = step.step_documents!.map(doc => ({
          category: doc.document_category,
          submitted: docMap.has(doc.document_category),
          documentId: docMap.get(doc.document_category), // Cache the ID
          submission_type: doc.submission_type,
          process_type: doc.process_type || 'submission',
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

  const handleHalt = () => {
    if (!onHalt) return;
    
    setConfirmDialog({
      open: true,
      title: 'Halt Step',
      description: 'Are you sure you want to halt this step? This will mark it as halted and stop progress.',
      onConfirm: async () => {
        const data: { remarks?: string } = {};
        if (remarks.trim()) {
          data.remarks = remarks.trim();
        }

        await onHalt(data);
        setRemarks('');
        setErrors({});
      },
    });
  };

  const handleSkip = () => {
    if (!onSkip) return;
    
    setConfirmDialog({
      open: true,
      title: 'Skip Step',
      description: 'Are you sure you want to skip this step? This will mark it as skipped and move to the next step.',
      onConfirm: async () => {
        const data: { remarks?: string } = {};
        if (remarks.trim()) {
          data.remarks = remarks.trim();
        }

        await onSkip(data);
        setRemarks('');
        setErrors({});
      },
    });
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
  const handleFillForm = (category: string, isEdit: boolean = false) => {
    if (!leadId) return;
    
    // Get document ID if editing
    const docStatus = documentStatuses.find(d => d.category === category);
    const documentId = docStatus?.documentId;
    
    // If editing and no document found, show error
    if (isEdit && !documentId) {
      toast.error('Document not found for editing');
      return;
    }
    
    // Build URL with edit parameter if editing
    const editParam = isEdit && documentId ? `&edit=true&documentId=${documentId}` : '';
    
    // Route based on category
    switch (category) {
      case 'profile':
        router.push(`/customer/profile/new?leadId=${leadId}${editParam}`);
        break;
      case 'quotation':
        router.push(`/forms/quotation/new?leadId=${leadId}${editParam}`);
        break;
      case 'ppa':
        router.push(`/forms/ppa/new?leadId=${leadId}${editParam}`);
        break;
      case 'bank_letter':
        router.push(`/forms/bank-letter/new?leadId=${leadId}${editParam}`);
        break;
      case 'cash_memo':
        // TODO: Add cash memo form route
        toast.warning('Cash Memo form not yet implemented');
        break;
      case 'vendor_agreement':
        // TODO: Add vendor agreement form route
        toast.warning('Vendor Agreement form not yet implemented');
        break;
      case 'material_dispatch':
        router.push(`/materials/dispatch/new?leadId=${leadId}${editParam}`);
        break;
      case 'material_received':
        router.push(`/materials/received/new?leadId=${leadId}${editParam}`);
        break;
      default:
        toast.warning(`Form for ${category} not yet implemented`);
    }
  };

  const handleViewForm = async (category: string) => {
    // Get document ID from cached statuses
    const docStatus = documentStatuses.find(d => d.category === category);
    const documentId = docStatus?.documentId;

    if (!documentId) {
      toast.error('No data found for ' + category);
      return;
    }

      // Route based on category
      switch (category) {
        case 'profile':
          router.push(`/customer/profile/${documentId}`);
          break;
        case 'quotation':
          router.push(`/forms/quotation/${documentId}`);
          break;
        case 'ppa':
          router.push(`/forms/ppa/${documentId}`);
          break;
        case 'bank_letter':
          router.push(`/forms/bank-letter/${documentId}`);
          break;
        case 'material_dispatch':
          router.push(`/materials/dispatch/view?leadId=${leadId}`);
          break;
        case 'material_received':
          router.push(`/materials/verification/view?leadId=${leadId}`);
          break;
        case 'cash_memo':
          // TODO: Add cash memo view route
          toast.warning('Cash Memo view not yet implemented');
          break;
        case 'vendor_agreement':
          // TODO: Add vendor agreement view route
          toast.warning('Vendor Agreement view not yet implemented');
          break;
        default:
          toast.warning(`View for ${category} not yet implemented`);
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
        toast.success('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
      }
    };
    input.click();
  };

  const handleViewFile = async (category: string) => {
    // Get document ID from cached statuses
    const docStatus = documentStatuses.find(d => d.category === category);
    const documentId = docStatus?.documentId;

    if (!documentId) {
      toast.error('No file found for ' + category);
      return;
    }

    try {
      // Open document view
      const viewResponse = await fetch(`/api/documents/view?documentId=${documentId}`);
      if (!viewResponse.ok) throw new Error('Failed to get view URL');

      const { url } = await viewResponse.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Failed to view file');
    }
  };

  const handleDeleteDocument = (category: string) => {
    // Get document ID from cached statuses
    const docStatus = documentStatuses.find(d => d.category === category);
    const documentId = docStatus?.documentId;

    if (!documentId) {
      toast.error('Document not found for ' + category);
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: 'Delete Document',
      description: `Are you sure you want to delete this ${category.replace(/_/g, ' ')}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // Delete document using the generic document endpoint
          const deleteResponse = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
          });

          if (!deleteResponse.ok) throw new Error('Failed to delete document');

          // Refresh document statuses
          await fetchDocumentStatuses();
          toast.success('Document deleted successfully');
        } catch (error) {
          console.error('Error deleting document:', error);
          toast.error('Failed to delete document');
        }
      },
    });
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
              <div className="rounded-md border border-border bg-muted/50 p-4">
                {loadingDocs ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Checking documents...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {documentStatuses.map((docStatus) => (
                        <div 
                          key={docStatus.category} 
                          className={`rounded-lg border p-3 transition-colors ${
                            docStatus.submitted 
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status Icon */}
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                              docStatus.submitted 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {docStatus.submitted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>

                            {/* Document Info and Actions */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    docStatus.submitted 
                                      ? 'text-green-700 dark:text-green-300' 
                                      : 'text-red-700 dark:text-red-300'
                                  }`}>
                                    {docStatus.submitted 
                                      ? `✓ ${docStatus.label} ${docStatus.process_type === 'verification' ? 'Verification' : 'Submission'} completed` 
                                      : `${docStatus.label} ${docStatus.process_type === 'verification' ? 'Verification' : 'Submission'} not completed. Please complete it.`
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                {!docStatus.submitted ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => docStatus.submission_type === 'form' 
                                      ? handleFillForm(docStatus.category)
                                      : handleUploadFile(docStatus.category)
                                    }
                                    disabled={isLoading}
                                    className="text-white"
                                    style={{ backgroundColor: '#22c55e' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                                  >
                                    Complete {docStatus.label} {docStatus.process_type === 'verification' ? 'Verification' : 'Submission'}
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => docStatus.submission_type === 'form'
                                        ? handleViewForm(docStatus.category)
                                        : handleViewFile(docStatus.category)
                                      }
                                      disabled={isLoading}
                                      className="bg-white dark:bg-gray-800"
                                    >
                                      View
                                    </Button>
                                    {userRole === 'admin' && (
                                      <>
                                        {docStatus.submission_type === 'form' && (
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleFillForm(docStatus.category, true)}
                                            disabled={isLoading}
                                            className="bg-white dark:bg-gray-800"
                                          >
                                            Edit
                                          </Button>
                                        )}
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteDocument(docStatus.category)}
                                          disabled={isLoading}
                                          className="text-destructive hover:text-destructive bg-white dark:bg-gray-800"
                                        >
                                          Delete
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errors.documents && (
                <p className="text-sm text-destructive">{errors.documents}</p>
              )}
            </div>
          )}



          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {userRole === 'admin' && onSkip && (
                <Button
                  type="button"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-white"
                  style={{ backgroundColor: '#FFA500' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF8C00'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFA500'}
                >
                  {isLoading ? 'Skipping...' : 'Skip'}
                </Button>
              )}
              {userRole === 'admin' && onHalt && (
                <Button
                  type="button"
                  onClick={handleHalt}
                  disabled={isLoading}
                  className="text-white"
                  style={{ backgroundColor: '#DC143C' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B22222'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC143C'}
                >
                  {isLoading ? 'Halting...' : 'Halt'}
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </Dialog>
  );
}
