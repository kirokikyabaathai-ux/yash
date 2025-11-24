/**
 * Step Master Management Page
 * 
 * Admin interface for managing timeline step configurations.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

'use client';

import { useState, useEffect } from 'react';
import { StepMasterList } from '@/components/admin/StepMasterList';
import { StepMasterForm, type StepMaster, type StepMasterFormData } from '@/components/admin/StepMasterForm';

export default function StepMasterPage() {
  const [steps, setSteps] = useState<StepMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStep, setEditingStep] = useState<StepMaster | undefined>(undefined);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/steps');
      
      if (!response.ok) {
        throw new Error('Failed to fetch steps');
      }

      const data = await response.json();
      setSteps(data.steps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStep(undefined);
    setShowForm(true);
  };

  const handleEdit = (step: StepMaster) => {
    setEditingStep(step);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStep(undefined);
  };

  const handleSubmit = async (data: StepMasterFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const url = editingStep ? `/api/steps/${editingStep.id}` : '/api/steps';
      const method = editingStep ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save step');
      }

      await fetchSteps();
      setShowForm(false);
      setEditingStep(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (stepId: string) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete step');
      }

      await fetchSteps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (reorderedSteps: StepMaster[]) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/steps/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: reorderedSteps.map((step) => ({
            id: step.id,
            order_index: step.order_index,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reorder steps');
      }

      await fetchSteps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Revert to original order on error
      await fetchSteps();
    } finally {
      setIsSaving(false);
    }
  };

  const maxOrderIndex = steps.length > 0 ? Math.max(...steps.map((s) => s.order_index)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Timeline Step Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure the workflow steps that all leads will follow. Drag and drop to reorder.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={handleCreate}
              disabled={isLoading || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Step
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingStep ? 'Edit Step' : 'Create New Step'}
            </h2>
            <StepMasterForm
              step={editingStep}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSaving}
              maxOrderIndex={maxOrderIndex}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Step List */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Timeline Steps ({steps.length})
            </h2>
            <StepMasterList
              steps={steps}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
              isLoading={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}
