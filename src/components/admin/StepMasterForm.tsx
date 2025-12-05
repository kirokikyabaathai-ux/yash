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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Name */}
      <div className="space-y-2">
        <Label htmlFor="step_name">
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
        />
        {errors.step_name && (
          <p className="text-sm text-destructive">{errors.step_name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use drag and drop to reorder steps after creation
        </p>
      </div>

      {/* Allowed Roles */}
      <div className="space-y-3">
        <Label>
          Allowed Roles <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-3">
          {ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role.value}`}
                checked={formData.allowed_roles.includes(role.value)}
                onCheckedChange={() => handleRoleToggle(role.value)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`role-${role.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {role.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.allowed_roles && (
          <p className="text-sm text-destructive">{errors.allowed_roles}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Select which roles can complete this step
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remarks_required"
            checked={formData.remarks_required}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, remarks_required: !!checked }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="remarks_required" className="text-sm font-normal cursor-pointer">
            Remarks Required
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="attachments_allowed"
            checked={formData.attachments_allowed}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, attachments_allowed: !!checked }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="attachments_allowed" className="text-sm font-normal cursor-pointer">
            Attachments Allowed
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="customer_upload"
            checked={formData.customer_upload}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, customer_upload: !!checked }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="customer_upload" className="text-sm font-normal cursor-pointer">
            Customer Upload Enabled
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires_installer_assignment"
            checked={formData.requires_installer_assignment}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, requires_installer_assignment: !!checked }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="requires_installer_assignment" className="text-sm font-normal cursor-pointer">
            Requires Installer Assignment
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, admin/office must assign an installer before completing this step
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : step ? 'Update Step' : 'Create Step'}
        </Button>
      </div>
    </form>
  );
}
