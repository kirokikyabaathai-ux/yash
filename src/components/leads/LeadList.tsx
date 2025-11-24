/**
 * Lead List Component
 * 
 * Displays a list of leads with filtering, search, and pagination.
 * 
 * Requirements: 2.1, 2.4, 2.5, 18.1, 18.2, 18.3, 18.4, 18.5
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lead, LeadFilters } from '@/types/api';
import { LeadStatusBadge } from './LeadStatusBadge';
import { SearchBar } from './SearchBar';
import { FilterPanel, type FilterOptions } from './FilterPanel';

interface LeadListProps {
  leads: Lead[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: LeadFilters) => void;
  filters?: LeadFilters;
  availableSteps?: Array<{ id: string; step_name: string }>;
}

export function LeadList({
  leads,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onFilterChange,
  filters = {},
  availableSteps = [],
}: LeadListProps) {
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (searchTerm: string) => {
    onFilterChange({ 
      ...filters, 
      search: searchTerm || undefined, 
      page: 1 
    });
  };

  const handleFilterChange = (filterOptions: FilterOptions) => {
    onFilterChange({ 
      ...filters, 
      ...filterOptions, 
      page: 1 
    });
  };

  const handleClearAll = () => {
    onFilterChange({ page: 1 });
  };

  const hasActiveFilters = 
    filters.search || 
    (filters.status && filters.status.length > 0) || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.currentStep;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full sm:w-auto">
            <SearchBar
              initialValue={filters.search}
              onSearch={handleSearch}
              placeholder="Search by name, phone, email, or address..."
            />
          </div>
          <FilterPanel
            initialFilters={{
              status: filters.status,
              dateFrom: filters.dateFrom,
              dateTo: filters.dateTo,
              currentStep: filters.currentStep,
            }}
            onFilterChange={handleFilterChange}
            availableSteps={availableSteps}
          />
        </div>
        
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
              </span>
            )}
            {filters.status && filters.status.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status.join(', ')}
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
              </span>
            )}
            {filters.currentStep && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Step: {availableSteps.find(s => s.id === filters.currentStep)?.step_name || filters.currentStep}
              </span>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center px-2">
        <p className="text-sm text-gray-700">
          Showing {leads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, total)} of {total} leads
        </p>
      </div>

      {/* Lead List */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No leads found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KW
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.customer_name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{lead.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        {lead.email && <div className="text-sm text-gray-500">{lead.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.kw_requirement ? `${lead.kw_requirement} KW` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{lead.customer_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{lead.address}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900 font-medium">{lead.phone}</span>
                  </div>
                  {lead.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900">{lead.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">KW:</span>
                    <span className="text-gray-900">{lead.kw_requirement ? `${lead.kw_requirement} KW` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{formatDate(lead.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-3 py-2 sm:py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Previous
          </button>
          
          <div className="flex space-x-1 overflow-x-auto max-w-full">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 sm:py-1 rounded-md text-sm font-medium touch-manipulation ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-3 py-2 sm:py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
