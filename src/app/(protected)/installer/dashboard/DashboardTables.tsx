'use client';

import Link from 'next/link';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card } from '@/components/ui/organisms/Card';
import { assignedLeadsColumns, completedTasksColumns } from './columns';

interface DashboardTablesProps {
  assignedLeads: any[];
  completedTasks: any[];
}

export function DashboardTables({ assignedLeads, completedTasks }: DashboardTablesProps) {
  return (
    <>
      {/* Assigned Leads */}
      <Card
        header={{
          title: 'My Assigned Leads',
          actions: (
            <Link
              href="/installer/leads"
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
          columns={assignedLeadsColumns}
          data={assignedLeads}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No assigned leads</p>
          }
        />
      </Card>

      {/* Recently Completed Tasks */}
      <Card
        header={{
          title: 'Recently Completed Tasks',
        }}
        padding="none"
      >
        <DataTable
          columns={completedTasksColumns}
          data={completedTasks.slice(0, 10)}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No completed tasks</p>
          }
        />
      </Card>
    </>
  );
}
