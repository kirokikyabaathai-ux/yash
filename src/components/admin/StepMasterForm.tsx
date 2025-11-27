/**
 * Step Master Form Component
 * 
 * Form for creating and editing step master configurations.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

'use client';

import { useState, useEffect } from 'react';
import type { UserRole } from '@/types/database';

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
      <div>
        <label htmlFor="step_name" className="block text-sm font-medium text-gray-700">
          Step Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="step_name"
          name="step_name"
          value={formData.step_name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Site Survey, Installation, Commissioning"
          className={`mt-1 block w-full rounded-md border ${
            errors.step_name ? 'border-red-300' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {errors.step_name && (
          <p className="mt-1 text-sm text-red-600">{errors.step_name}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Use drag and drop to reorder steps after creation
        </p>
      </div>

      {/* Allowed Roles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed Roles <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {ROLE_OPTIONS.map((role) => (
            <label key={role.value} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowed_roles.includes(role.value)}
                onChange={() => handleRoleToggle(role.value)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-700">{role.label}</span>
            </label>
          ))}
        </div>
        {errors.allowed_roles && (
          <p className="mt-1 text-sm text-red-600">{errors.allowed_roles}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Select which roles can complete this step
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="remarks_required"
            checked={formData.remarks_required}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">Remarks Required</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="attachments_allowed"
            checked={formData.attachments_allowed}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">Attachments Allowed</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="customer_upload"
            checked={formData.customer_upload}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">Customer Upload Enabled</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="requires_installer_assignment"
            checked={formData.requires_installer_assignment}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-700">Requires Installer Assignment</span>
        </label>
      </div>
      <p className="text-sm text-gray-500">
        When enabled, admin/office must assign an installer before completing this step
      </p>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : step ? 'Update Step' : 'Create Step'}
        </button>
      </div>
    </form>
  );
}
