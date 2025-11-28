/**
 * Agent Leads Client Component
 * Client-side component that handles lead fetching and filtering
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeadList } from '@/components/leads/LeadList';
import type { Lead, LeadFilters } from '@/types/api';

export function AgentLeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSteps, setAvailableSteps] = useState<Array<{ id: string; step_name: string }>>([]);

  const pageSize = 10;

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.status) {
        filters.status.forEach(s => params.append('status', s));
      }
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.currentStep) params.append('currentStep', filters.currentStep);

      const response = await fetch(`/api/leads?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/steps');
      if (response.ok) {
        const data = await response.json();
        setAvailableSteps(data.steps || []);
      }
    } catch (err) {
      console.error('Failed to fetch steps:', err);
    }
  };

  const handleFilterChange = (newFilters: LeadFilters) => {
    setFilters(newFilters);
    setCurrentPage(newFilters.page || 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchLeads();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchSteps();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 max-w-md">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={fetchLeads}
            className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Leads</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage and track your solar installation leads
            </p>
          </div>
          <Link
            href="/agent/leads/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
          >
            Create New Lead
          </Link>
        </div>

        {isLoading && leads.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <LeadList
            leads={leads}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            filters={filters}
            availableSteps={availableSteps}
            baseUrl="/agent/leads"
          />
        )}
      </div>
    </div>
  );
}
