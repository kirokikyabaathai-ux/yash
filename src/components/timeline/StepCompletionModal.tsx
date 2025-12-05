/**
 * Step Completion Modal Component
 * 
 * Modal for completing timeline steps with remarks and attachments.
 * Uses shadcn/ui Dialog component for consistent modal behavior.
 * 
 * Requirements: 2.4, 9.1, 9.2, 9.3, 9.4, 9.5
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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

interface StepCompletionModalProps {
  step: TimelineStepData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { remarks?: string; attachments?: string[] }) => Promise<void>;
  isLoading?: boolean;
  leadInstallerId?: string | null;
  leadId?: string;
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
  const [showInstallerWarning, setShowInstallerWarning] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step.remarks_required && !remarks.trim()) {
      newErrors.remarks = 'Remarks are required for this step';
    }

    // Check if installer assignment is required
    if (step.requires_installer_assignment && !leadInstallerId) {
      setShowInstallerWarning(true);
      return false;
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
      onClose();
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
