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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Timeline Step Management</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure the workflow steps that all leads will follow. Drag and drop to reorder.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isLoading || isSaving}
              size="lg"
              className="shadow-md"
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form Drawer */}
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <div className="p-6 border-b bg-muted/30">
              <SheetHeader>
                <SheetTitle className="text-xl">
                  {editingStep ? 'Edit Step' : 'Create New Step'}
                </SheetTitle>
                <SheetDescription className="text-sm">
                  {editingStep 
                    ? 'Update the step configuration below.' 
                    : 'Configure a new timeline step for the lead workflow.'}
                </SheetDescription>
              </SheetHeader>
            </div>
            <div className="p-6">
              <StepMasterForm
                step={editingStep}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Step List */}
        {!isLoading && (
          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Timeline Steps
                </CardTitle>
                <span className="text-sm text-muted-foreground font-normal">
                  {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {steps.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-foreground">No steps configured</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get started by creating your first timeline step.
                  </p>
                  <Button
                    onClick={handleCreate}
                    className="mt-6"
                  >
                    Create First Step
                  </Button>
                </div>
              ) : (
                <StepMasterList
                  steps={steps}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                  isLoading={isSaving}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
