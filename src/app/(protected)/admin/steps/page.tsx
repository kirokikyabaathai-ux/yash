/**
 * Step Master Management Page
 * 
 * Admin interface for managing timeline step configurations.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

'use client';

import { useState, useEffect } from 'react';
import { StepMasterList } from '@/components/admin/StepMasterList';
import { StepMasterForm, type StepMaster, type StepMasterFormData } from '@/components/admin/StepMasterForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/organisms/Card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, AlertCircle, FileText } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

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
        <PageLayout
          title="Timeline Step Management"
          description="Configure the workflow steps that all leads will follow. Drag and drop to reorder."
          actions={
            <Button
              onClick={handleCreate}
              disabled={isLoading || isSaving}
              size="lg"
              variant="primary"
            >
              <Plus size={20} className="mr-2" />
              Create New Step
            </Button>
          }
        >

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
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
            <Card padding="lg">
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading steps...</p>
                </div>
              </div>
            </Card>
          )}

          {/* Step List */}
          {!isLoading && (
            <Card
              header={{
                title: 'Timeline Steps',
                subtitle: `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`,
              }}
              padding="lg"
            >
              {steps.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No steps configured
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get started by creating your first timeline step.
                  </p>
                  <Button onClick={handleCreate} variant="primary">
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
            </Card>
          )}
        </PageLayout>
      </div>
    </div>
  );
}
