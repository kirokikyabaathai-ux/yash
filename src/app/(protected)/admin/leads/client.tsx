/**
 * Admin Leads Client Component
 * Client-side component that handles lead fetching and filtering
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card } from '@/components/ui/organisms/Card';
import { PageLayout } from '@/components/layout/PageLayout';
import { leadsColumns } from './columns';
import type { Lead } from '@/types/api';

export function AdminLeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/leads');

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
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
        <PageLayout
          title="All Leads"
          description="Manage and track all solar installation leads across the system"
        >
          <Card
            header={{
              title: 'Leads',
              actions: (
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Back to Dashboard
                </Link>
              ),
            }}
            padding="none"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={leadsColumns}
                data={leads}
                sortable
                filterable
                keyExtractor={(row) => row.id}
                emptyState={
                  <p className="text-sm text-muted-foreground">No leads found</p>
                }
              />
            )}
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
