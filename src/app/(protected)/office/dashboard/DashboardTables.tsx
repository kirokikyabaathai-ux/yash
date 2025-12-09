'use client';

import Link from 'next/link';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card } from '@/components/ui/organisms/Card';
import { pendingLeadsColumns, allLeadsColumns } from './columns';

interface DashboardTablesProps {
  pendingLeads: any[];
  leads: any[];
}

export function DashboardTables({ pendingLeads, leads }: DashboardTablesProps) {
  return (
    <>
      {/* Pending Leads */}
      <Card
        header={{
          title: 'Pending Leads',
          actions: (
            <Link
              href="/office/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          ),
        }}
        className="mb-8"
        padding="none"
      >
        <DataTable
          columns={pendingLeadsColumns}
          data={pendingLeads}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No pending leads</p>
          }
        />
      </Card>

      {/* All Leads */}
      <Card
        header={{
          title: 'All Leads',
          actions: (
            <Link
              href="/office/leads"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          ),
        }}
        padding="none"
      >
        <DataTable
          columns={allLeadsColumns}
          data={leads}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No leads found</p>
          }
        />
      </Card>
    </>
  );
}
