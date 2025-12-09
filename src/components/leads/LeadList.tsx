/**
 * Lead List Component
 * 
 * Displays a list of leads with filtering, search, and pagination.
 * Uses Penpot design system components for consistent styling.
 * 
 * Requirements: 2.1, 2.4, 2.5, 18.1, 18.2, 18.3, 18.4, 18.5, 6.1, 6.2, 6.3
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Lead, LeadFilters } from '@/types/api';
import { LeadStatusBadge } from './LeadStatusBadge';
import { SearchBar } from '@/components/ui/molecules/SearchBar';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { penpotSpacing, penpotTypography } from '@/lib/design-system/tokens';

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
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ 
          ...filters, 
          search: searchValue.trim() || undefined, 
          page: 1 
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update local search value when filters change externally
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || '');
    }
  }, [filters.search]);

  const handleSearchClear = () => {
    setSearchValue('');
    onFilterChange({ 
      ...filters, 
      search: undefined, 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[4] }}>
      {/* Search and Filters */}
      <Card>
        <CardContent style={{ padding: penpotSpacing[4] }}>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full sm:w-auto">
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                onClear={handleSearchClear}
                placeholder="Search by name, phone, email, or address..."
                size="md"
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
              <span style={{ 
                fontSize: penpotTypography.body.small.fontSize,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Active filters:
              </span>
              {filters.search && (
                <Badge variant="subtle" colorScheme="blue" size="sm">
                  Search: {filters.search}
                </Badge>
              )}
              {filters.status && filters.status.length > 0 && (
                <Badge variant="subtle" colorScheme="blue" size="sm">
                  Status: {filters.status.join(', ')}
                </Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="subtle" colorScheme="blue" size="sm">
                  Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                </Badge>
              )}
              {filters.currentStep && (
                <Badge variant="subtle" colorScheme="blue" size="sm">
                  Step: {availableSteps.find(s => s.id === filters.currentStep)?.step_name || filters.currentStep}
                </Badge>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center px-2">
        <p style={{ 
          fontSize: penpotTypography.body.small.fontSize,
          color: 'var(--penpot-neutral-secondary)'
        }}>
          Showing {leads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, total)} of {total} leads
        </p>
      </div>

      {/* Lead List - Desktop */}
      <div className="hidden md:block">
        <DataTable
          data={leads}
          keyExtractor={(lead) => lead.id}
          columns={[
            {
              key: 'customer_name',
              header: 'Customer',
              render: (value, lead) => (
                <div>
                  <div style={{ 
                    fontWeight: penpotTypography.body.bold.fontWeight,
                    fontSize: penpotTypography.body.regular.fontSize
                  }}>
                    {lead.customer_name}
                  </div>
                  <div style={{ 
                    color: 'var(--penpot-neutral-secondary)',
                    fontSize: penpotTypography.body.small.fontSize,
                    marginTop: penpotSpacing[1]
                  }} className="truncate max-w-xs">
                    {lead.address}
                  </div>
                </div>
              ),
            },
            {
              key: 'phone',
              header: 'Contact',
              render: (value, lead) => (
                <div>
                  <div style={{ fontSize: penpotTypography.body.regular.fontSize }}>
                    {lead.phone}
                  </div>
                  {lead.email && (
                    <div style={{ 
                      color: 'var(--penpot-neutral-secondary)',
                      fontSize: penpotTypography.body.small.fontSize,
                      marginTop: penpotSpacing[1]
                    }}>
                      {lead.email}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (value, lead) => <LeadStatusBadge status={lead.status} />,
            },
            {
              key: 'created_at',
              header: 'Created',
              render: (value, lead) => (
                <span style={{ color: 'var(--penpot-neutral-secondary)' }}>
                  {formatDate(lead.created_at)}
                </span>
              ),
            },
            {
              key: 'id',
              header: 'Actions',
              render: (value, lead) => (
                <Link
                  href={`${baseUrl}/${lead.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="link" size="sm">
                    View Details
                  </Button>
                </Link>
              ),
              className: 'text-right',
            },
          ]}
          pagination={{
            currentPage,
            totalPages,
            onPageChange,
            variant: 'primary',
          }}
          emptyState={
            <div>
              <p style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                No leads found
              </p>
              <p style={{ 
                fontSize: penpotTypography.body.small.fontSize,
                color: 'var(--penpot-neutral-secondary)',
                marginTop: penpotSpacing[2]
              }}>
                Try adjusting your search or filter criteria
              </p>
            </div>
          }
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[4] }}>
        {leads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                No leads found
              </p>
              <p style={{ 
                fontSize: penpotTypography.body.small.fontSize,
                color: 'var(--penpot-neutral-secondary)',
                marginTop: penpotSpacing[2]
              }}>
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent style={{ padding: penpotSpacing[4] }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 style={{ 
                        fontSize: penpotTypography.body.regular.fontSize,
                        fontWeight: penpotTypography.body.bold.fontWeight
                      }}>
                        {lead.customer_name}
                      </h3>
                      <p style={{ 
                        color: 'var(--penpot-neutral-secondary)',
                        fontSize: penpotTypography.body.small.fontSize,
                        marginTop: penpotSpacing[1]
                      }}>
                        {lead.address}
                      </p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: penpotSpacing[2],
                    fontSize: penpotTypography.body.small.fontSize
                  }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--penpot-neutral-secondary)' }}>Phone:</span>
                      <span style={{ fontWeight: penpotTypography.body.bold.fontWeight }}>
                        {lead.phone}
                      </span>
                    </div>
                    {lead.email && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--penpot-neutral-secondary)' }}>Email:</span>
                        <span>{lead.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--penpot-neutral-secondary)' }}>Created:</span>
                      <span>{formatDate(lead.created_at)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: penpotSpacing[4], paddingTop: penpotSpacing[3] }} className="border-t">
                    <Link href={`${baseUrl}/${lead.id}`} className="block">
                      <Button variant="primary" size="md" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  fullWidth
                >
                  Previous
                </Button>
                
                <div className="flex justify-center gap-1 overflow-x-auto">
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
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  fullWidth
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
