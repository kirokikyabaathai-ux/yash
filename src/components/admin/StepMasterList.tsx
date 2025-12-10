/**
 * Step Master List Component
 * 
 * Displays list of step master configurations with drag-and-drop reordering.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

'use client';

import React, { useState } from 'react';
import { List, arrayMove } from 'react-movable';
import type { StepMaster } from './StepMasterForm';
import { Badge } from '@/components/ui/atoms';
import { Button } from '@/components/ui/button';
import { H3, Body, Small } from '@/components/ui/atoms';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface StepMasterListProps {
  steps: StepMaster[];
  onEdit: (step: StepMaster) => void;
  onDelete: (stepId: string) => void;
  onReorder: (steps: StepMaster[]) => Promise<void>;
  isLoading?: boolean;
}

export function StepMasterList({
  steps,
  onEdit,
  onDelete,
  onReorder,
  isLoading = false,
}: StepMasterListProps) {
  const [localSteps, setLocalSteps] = useState<StepMaster[]>(steps);
  const [hasChanges, setHasChanges] = useState(false);
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

  // Update local steps when props change (only if no pending changes)
  React.useEffect(() => {
    if (!hasChanges) {
      setLocalSteps(steps);
    }
  }, [steps, hasChanges]);

  const handleReorderChange = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    const reorderedSteps = arrayMove(localSteps, oldIndex, newIndex);
    setLocalSteps(reorderedSteps);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    await onReorder(localSteps);
    setHasChanges(false);
  };

  const handleCancelReorder = () => {
    setLocalSteps(steps);
    setHasChanges(false);
  };

  const handleDeleteClick = (step: StepMaster) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Step',
      description: `Are you sure you want to delete "${step.step_name}"? This will affect all leads using this step.`,
      onConfirm: () => {
        onDelete(step.id);
      },
    });
  };

  if (localSteps.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg border-2 border-dashed border-border">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <H3 className="mt-2">No steps configured</H3>
        <Body color="secondary" className="mt-1">
          Get started by creating a new timeline step.
        </Body>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save/Cancel buttons - shown when order changes */}
      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2"
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
              <Small className="font-medium text-yellow-800 dark:text-yellow-400">
                You have unsaved changes to the step order
              </Small>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelReorder}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Order'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <List
        values={localSteps}
        onChange={handleReorderChange}
        lockVertically
        renderList={({ children, props }) => (
          <div {...props} className="space-y-2">
            {children}
          </div>
        )}
        renderItem={({ value: step, props, index, isDragged }) => (
          <div
            {...props}
            key={step.id}
            className={`relative bg-card border border-border rounded-lg p-4 transition-all ${
              isDragged
                ? 'opacity-50 shadow-2xl z-50 scale-105'
                : 'hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              ...props.style,
              cursor: isLoading ? 'not-allowed' : isDragged ? 'grabbing' : 'grab',
            }}
          >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
              {/* Drag Handle */}
              <div className="flex-shrink-0 mt-1 hidden sm:block">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <Badge variant="solid" colorScheme="blue" size="md" className="h-8 w-8 rounded-full flex items-center justify-center">
                    {(index ?? 0) + 1}
                  </Badge>
                  <H3 className="break-words">{step.step_name}</H3>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {/* Allowed Roles */}
                  <div className="flex flex-wrap items-center gap-1">
                    <Small color="secondary">Roles:</Small>
                    {step.allowed_roles.map((role, roleIndex) => (
                      <Badge
                        key={`${step.id}-${role}-${roleIndex}`}
                        variant="subtle"
                        colorScheme="gray"
                        size="sm"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {step.remarks_required && (
                      <Badge variant="subtle" colorScheme="yellow" size="sm">
                        Remarks Required
                      </Badge>
                    )}
                    {step.attachments_allowed && (
                      <Badge variant="subtle" colorScheme="green" size="sm">
                        Attachments Allowed
                      </Badge>
                    )}
                    {step.customer_upload && (
                      <Badge variant="subtle" colorScheme="blue" size="sm">
                        Customer Upload
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:ml-4 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(step)}
                disabled={isLoading || hasChanges}
                title={hasChanges ? 'Save or cancel reorder first' : 'Edit step'}
                className="text-primary hover:bg-primary/10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(step)}
                disabled={isLoading || hasChanges}
                title={hasChanges ? 'Save or cancel reorder first' : 'Delete step'}
                className="text-destructive hover:bg-destructive/10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        )}
      />

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Small className="text-blue-800 dark:text-blue-400">
          <strong>Tip:</strong> <span className="hidden sm:inline">Drag and drop steps to reorder them, then click "Save Order".</span><span className="sm:hidden">On desktop, you can drag and drop steps to reorder them.</span> The order determines how
          they appear in the timeline for all leads.
        </Small>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
}
