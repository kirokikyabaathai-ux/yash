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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeadListProps {
  leads: Lead[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: LeadFilters) => void;
  filters?: LeadFilters;
  availableSteps?: Array<{ id: string; step_name: string }>;
  baseUrl?: string; // Base URL for lead detail pages (e.g., '/office/leads', '/agent/leads')
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
  baseUrl = '/leads', // Default to /leads for backward compatibility
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground text-lg">No leads found</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Customer</TableHead>
                  <TableHead className="font-semibold text-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Created</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <div className="font-medium text-foreground">{lead.customer_name}</div>
                      <div className="text-muted-foreground text-sm truncate max-w-xs mt-1">{lead.address}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-foreground">{lead.phone}</div>
                      {lead.email && <div className="text-muted-foreground text-sm mt-1">{lead.email}</div>}
                    </TableCell>
                    <TableCell className="py-4">
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Link
                        href={`${baseUrl}/${lead.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-card rounded-lg border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">{lead.customer_name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{lead.address}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{lead.phone}</span>
                  </div>
                  {lead.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{lead.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <Link
                    href={`${baseUrl}/${lead.id}`}
                    className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
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
