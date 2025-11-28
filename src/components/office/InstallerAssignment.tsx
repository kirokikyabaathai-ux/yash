/**
 * InstallerAssignment Component
 * 
 * Allows office team to assign installers to leads.
 * Updates the lead.installer_id field.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { User, Lead } from '@/types/api';

interface InstallerAssignmentProps {
  lead: Lead;
  onAssignmentComplete?: (installerId: string) => void;
  onAssignmentError?: (error: string) => void;
}

export function InstallerAssignment({
  lead,
  onAssignmentComplete,
  onAssignmentError,
}: InstallerAssignmentProps) {
  const [installers, setInstallers] = useState<User[]>([]);
  const [selectedInstallerId, setSelectedInstallerId] = useState<string>(
    lead.installer_id || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInstallers();
  }, []);

  const fetchInstallers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users?role=installer&status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch installers');
      }
      const data = await response.json();
      setInstallers(data.users || []);
    } catch (error) {
      console.error('Error fetching installers:', error);
      if (onAssignmentError) {
        onAssignmentError('Failed to load installers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedInstallerId) {
      if (onAssignmentError) {
        onAssignmentError('Please select an installer');
      }
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installer_id: selectedInstallerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to assign installer');
      }

      if (onAssignmentComplete) {
        onAssignmentComplete(selectedInstallerId);
      }
    } catch (error) {
      console.error('Error assigning installer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Assignment failed';
      if (onAssignmentError) {
        onAssignmentError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installer_id: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to unassign installer');
      }

      setSelectedInstallerId('');
      if (onAssignmentComplete) {
        onAssignmentComplete('');
      }
    } catch (error) {
      console.error('Error unassigning installer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unassignment failed';
      if (onAssignmentError) {
        onAssignmentError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="installer-select" className="block text-sm font-medium text-foreground mb-2">
          Assign Installer
        </label>
        <select
          id="installer-select"
          value={selectedInstallerId}
          onChange={(e) => setSelectedInstallerId(e.target.value)}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <option value="">Select an installer...</option>
          {installers.map((installer) => (
            <option key={installer.id} value={installer.id}>
              {installer.name} - {installer.phone}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAssign}
          disabled={isSaving || !selectedInstallerId || selectedInstallerId === lead.installer_id}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSaving ? 'Assigning...' : 'Assign Installer'}
        </button>

        {lead.installer_id && (
          <button
            onClick={handleUnassign}
            disabled={isSaving}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Unassigning...' : 'Unassign'}
          </button>
        )}
      </div>

      {lead.installer_id && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
          <p className="text-sm text-primary">
            <span className="font-medium">Currently assigned:</span>{' '}
            {installers.find((i) => i.id === lead.installer_id)?.name || 'Unknown'}
          </p>
        </div>
      )}
    </div>
  );
}
