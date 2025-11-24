/**
 * Step Master List Component
 * 
 * Displays list of step master configurations with drag-and-drop reordering.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

'use client';

import { useState } from 'react';
import type { StepMaster } from './StepMasterForm';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedSteps = [...steps];
    const [draggedStep] = reorderedSteps.splice(draggedIndex, 1);
    reorderedSteps.splice(dragOverIndex, 0, draggedStep);

    // Update order_index for all steps
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      order_index: index + 1,
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);

    await onReorder(updatedSteps);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDeleteClick = (step: StepMaster) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${step.step_name}"? This will affect all leads using this step.`
      )
    ) {
      onDelete(step.id);
    }
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No steps configured</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new timeline step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          draggable={!isLoading}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          className={`bg-white border rounded-lg p-4 transition-all ${
            draggedIndex === index
              ? 'opacity-50 cursor-grabbing'
              : 'cursor-grab hover:shadow-md'
          } ${
            dragOverIndex === index && draggedIndex !== index
              ? 'border-blue-500 border-2'
              : 'border-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
              {/* Drag Handle */}
              <div className="flex-shrink-0 mt-1 hidden sm:block">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium flex-shrink-0">
                    {step.order_index}
                  </span>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">{step.step_name}</h3>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {/* Allowed Roles */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-xs text-gray-500">Roles:</span>
                    {step.allowed_roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {step.remarks_required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Remarks Required
                      </span>
                    )}
                    {step.attachments_allowed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Attachments Allowed
                      </span>
                    )}
                    {step.customer_upload && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Customer Upload
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:ml-4 justify-end">
              <button
                onClick={() => onEdit(step)}
                disabled={isLoading}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title="Edit step"
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
              </button>
              <button
                onClick={() => handleDeleteClick(step)}
                disabled={isLoading}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                title="Delete step"
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
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> <span className="hidden sm:inline">Drag and drop steps to reorder them.</span><span className="sm:hidden">On desktop, you can drag and drop steps to reorder them.</span> The order determines how
          they appear in the timeline for all leads.
        </p>
      </div>
    </div>
  );
}
