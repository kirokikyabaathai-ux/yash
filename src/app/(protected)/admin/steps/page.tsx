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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Timeline Step Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure the workflow steps that all leads will follow. Drag and drop to reorder.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <div className="mb-6">
            <Button
              onClick={handleCreate}
              disabled={isLoading || isSaving}
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
            </Button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingStep ? 'Edit Step' : 'Create New Step'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StepMasterForm
                step={editingStep}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Step List */}
        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>
                Timeline Steps ({steps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StepMasterList
                steps={steps}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
