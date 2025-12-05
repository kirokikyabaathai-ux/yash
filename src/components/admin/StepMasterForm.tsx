/**
 * Step Master Form Component
 * 
 * Form for creating and editing step master configurations.
 * 
 * Requirements: 2.1, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3
 */

'use client';

import { useState, useEffect } from 'react';
import type { UserRole } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export interface StepMasterFormData {
  step_name: string;
  allowed_roles: UserRole[];
  remarks_required: boolean;
  attachments_allowed: boolean;
  customer_upload: boolean;
  requires_installer_assignment: boolean;
}

export interface StepMaster extends StepMasterFormData {
  id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface StepMasterFormProps {
  step?: StepMaster;
  onSubmit: (data: StepMasterFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'office', label: 'Office Team' },
  { value: 'agent', label: 'Agent' },
  { value: 'installer', label: 'Installer' },
  { value: 'customer', label: 'Customer' },
];

export function StepMasterForm({
  step,
  onSubmit,
  onCancel,
  isLoading = false,
}: StepMasterFormProps) {
  const [formData, setFormData] = useState<StepMasterFormData>({
    step_name: step?.step_name || '',
    allowed_roles: step?.allowed_roles || ['admin', 'office'],
    remarks_required: step?.remarks_required ?? false,
    attachments_allowed: step?.attachments_allowed ?? false,
    customer_upload: step?.customer_upload ?? false,
    requires_installer_assignment: step?.requires_installer_assignment ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when step prop changes
  useEffect(() => {
    setFormData({
      step_name: step?.step_name || '',
      allowed_roles: step?.allowed_roles || ['admin', 'office'],
      remarks_required: step?.remarks_required ?? false,
      attachments_allowed: step?.attachments_allowed ?? false,
      customer_upload: step?.customer_upload ?? false,
      requires_installer_assignment: step?.requires_installer_assignment ?? false,
    });
    setErrors({});
  }, [step]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.step_name.trim()) {
      newErrors.step_name = 'Step name is required';
    }

    if (formData.allowed_roles.length === 0) {
      newErrors.allowed_roles = 'At least one role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => {
      const newRoles = prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter((r) => r !== role)
        : [...prev.allowed_roles, role];
      return { ...prev, allowed_roles: newRoles };
    });

    // Clear error for allowed_roles
    if (errors.allowed_roles) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.allowed_roles;
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="step_name" className="text-sm font-medium">
              Step Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="step_name"
              name="step_name"
              value={formData.step_name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., Site Survey, Installation, Commissioning"
              aria-invalid={!!errors.step_name}
              className="text-base"
            />
            {errors.step_name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.step_name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Use drag and drop to reorder steps after creation
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Permissions</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Select which roles can complete this step
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((role) => (
            <div 
              key={role.value} 
              className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={`role-${role.value}`}
                checked={formData.allowed_roles.includes(role.value)}
                onCheckedChange={() => handleRoleToggle(role.value)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`role-${role.value}`}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {role.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.allowed_roles && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.allowed_roles}
          </p>
        )}
      </div>

      {/* Step Configuration Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Step Configuration</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Configure additional requirements for this step
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id="remarks_required"
              checked={formData.remarks_required}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, remarks_required: !!checked }))
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="remarks_required" className="text-sm font-medium cursor-pointer">
                Remarks Required
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                User must provide remarks when completing this step
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id="attachments_allowed"
              checked={formData.attachments_allowed}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, attachments_allowed: !!checked }))
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="attachments_allowed" className="text-sm font-medium cursor-pointer">
                Attachments Allowed
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow users to upload files when completing this step
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id="customer_upload"
              checked={formData.customer_upload}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, customer_upload: !!checked }))
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="customer_upload" className="text-sm font-medium cursor-pointer">
                Customer Upload Enabled
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow customers to upload documents for this step
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id="requires_installer_assignment"
              checked={formData.requires_installer_assignment}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, requires_installer_assignment: !!checked }))
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="requires_installer_assignment" className="text-sm font-medium cursor-pointer">
                Requires Installer Assignment
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Admin/office must assign an installer before completing this step
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            step ? 'Update Step' : 'Create Step'
          )}
        </Button>
      </div>
    </form>
  );
}
