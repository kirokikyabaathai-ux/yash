/**
 * Filter Panel Component
 * 
 * Provides comprehensive filtering options for leads including:
 * - Status filter
 * - Date range filter
 * - Timeline step filter
 * - Multiple filters can be combined with AND logic
 * 
 * Requirements: 18.2, 18.3, 18.4, 18.5
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import type { LeadStatus } from '@/types/database';

export interface FilterOptions {
  status?: LeadStatus[];
  dateFrom?: string;
  dateTo?: string;
  currentStep?: string;
}

interface FilterPanelProps {
  initialFilters?: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableSteps?: Array<{ id: string; step_name: string }>;
  className?: string;
}

export function FilterPanel({
  initialFilters = {},
  onFilterChange,
  availableSteps = [],
  className = '',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus[]>(
    initialFilters.status || []
  );
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');
  const [currentStep, setCurrentStep] = useState(initialFilters.currentStep || '');
  const panelRef = useRef<HTMLDivElement>(null);

  // Update local state when initialFilters change
  useEffect(() => {
    setSelectedStatus(initialFilters.status || []);
    setDateFrom(initialFilters.dateFrom || '');
    setDateTo(initialFilters.dateTo || '');
    setCurrentStep(initialFilters.currentStep || '');
  }, [initialFilters]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const statusOptions: LeadStatus[] = [
    'lead',
    'lead_interested',
    'lead_processing',
    'lead_completed',
    'lead_cancelled'
  ];

  const statusLabels: Record<LeadStatus, string> = {
    'lead': 'New Leads',
    'lead_interested': 'Lead Interested',
    'lead_processing': 'Lead Processing',
    'lead_completed': 'Lead Completed',
    'lead_cancelled': 'Lead Cancelled'
  };

  const handleStatusToggle = (status: LeadStatus) => {
    // Single selection only - if clicking the same status, deselect it
    if (selectedStatus.includes(status)) {
      setSelectedStatus([]);
    } else {
      setSelectedStatus([status]);
    }
  };

  const handleApplyFilters = () => {
    const filters: FilterOptions = {};

    if (selectedStatus.length > 0) {
      filters.status = selectedStatus;
    }

    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }

    if (dateTo) {
      filters.dateTo = dateTo;
    }

    if (currentStep) {
      filters.currentStep = currentStep;
    }

    onFilterChange(filters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    setSelectedStatus([]);
    setDateFrom('');
    setDateTo('');
    setCurrentStep('');
    onFilterChange({});
  };

  const hasActiveFilters =
    selectedStatus.length > 0 || dateFrom || dateTo || currentStep;

  const activeFilterCount =
    (selectedStatus.length > 0 ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (currentStep ? 1 : 0);

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation w-full sm:w-auto justify-center sm:justify-start ${
          hasActiveFilters
            ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 bg-white sm:rounded-lg shadow-lg border-t sm:border border-gray-200 z-50 overflow-y-auto">
          <div className="p-4 space-y-4 max-h-screen sm:max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filter Leads</h3>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusToggle(status)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                      selectedStatus.includes(status)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="dateFrom" className="block text-xs text-gray-600 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dateTo" className="block text-xs text-gray-600 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Step Filter */}
            {availableSteps.length > 0 && (
              <div>
                <label htmlFor="currentStep" className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline Step
                </label>
                <select
                  id="currentStep"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All steps</option>
                  {availableSteps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.step_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 touch-manipulation order-2 sm:order-1"
                disabled={!hasActiveFilters}
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation order-1 sm:order-2"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
