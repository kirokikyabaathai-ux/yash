/**
 * InstallerDataRestrictions Component
 * 
 * Enforces data access restrictions for installer role.
 * Ensures installers cannot access:
 * - PM Suryaghar form data
 * - Financial details (payment information, loan details)
 * - Survey information (detailed customer data beyond basic contact)
 * 
 * Requirements: 10.5
 */

'use client';

import React from 'react';
import type { Lead } from '@/types/api';

interface InstallerDataRestrictionsProps {
  userRole: string;
  children: React.ReactNode;
  restrictedContent?: React.ReactNode;
}

/**
 * Wrapper component that hides content from installers
 */
export function InstallerDataRestrictions({
  userRole,
  children,
  restrictedContent,
}: InstallerDataRestrictionsProps) {
  if (userRole === 'installer') {
    return restrictedContent ? <>{restrictedContent}</> : null;
  }

  return <>{children}</>;
}

/**
 * Filters lead data to remove sensitive information for installers
 */
export function filterLeadDataForInstaller(lead: Lead): Partial<Lead> {
  return {
    id: lead.id,
    customer_name: lead.customer_name,
    phone: lead.phone,
    address: lead.address,
    status: lead.status,
    installer_id: lead.installer_id,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    // Exclude: email, kw_requirement, roof_type, notes, created_by, customer_account_id, source
  };
}

/**
 * Checks if a user role can access financial details
 */
export function canAccessFinancialDetails(userRole: string): boolean {
  return ['admin', 'office', 'agent'].includes(userRole);
}

/**
 * Checks if a user role can access survey information
 */
export function canAccessSurveyInformation(userRole: string): boolean {
  return ['admin', 'office', 'agent'].includes(userRole);
}

/**
 * Component that displays a restriction message for installers
 */
export function InstallerRestrictionMessage() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-yellow-600 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Access Restricted
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            This information is not available for installer accounts. You can only access
            installation-related tasks and documents.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Filters step remarks to remove financial information for installers
 */
export function filterStepRemarksForInstaller(remarks: string | null, stepName: string): string | null {
  if (!remarks) return null;

  // If the step is payment or loan related, hide the remarks from installers
  const financialStepKeywords = ['payment', 'loan', 'subsidy', 'financial', 'amount', 'bank'];
  const isFinancialStep = financialStepKeywords.some(keyword =>
    stepName.toLowerCase().includes(keyword)
  );

  if (isFinancialStep) {
    return '[Financial information hidden]';
  }

  return remarks;
}

/**
 * Hook to check if current user is an installer
 */
export function useIsInstaller(userRole: string): boolean {
  return userRole === 'installer';
}

/**
 * Filters document list to show only installation-related documents for installers
 */
export function filterDocumentsForInstaller<T extends { type: string }>(
  documents: T[]
): T[] {
  return documents.filter(doc => doc.type === 'installation');
}
