'use client';

import Link from 'next/link';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card } from '@/components/ui/organisms/Card';
import { leadsColumns, usersColumns } from './columns';

interface DashboardTablesProps {
  leads: any[];
  users: any[];
}

export function DashboardTables({ leads, users }: DashboardTablesProps) {
  return (
    <>
      {/* Recent Leads - Using DataTable component */}
      <Card
        header={{
          title: 'Recent Leads',
          actions: (
            <Link
              href="/admin/leads"
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
          columns={leadsColumns}
          data={leads}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No leads found</p>
          }
        />
      </Card>

      {/* User Management - Using DataTable component */}
      <Card
        header={{
          title: 'User Management',
          actions: (
            <Link
              href="/admin/users"
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
          columns={usersColumns}
          data={users}
          sortable
          keyExtractor={(row) => row.id}
          emptyState={
            <p className="text-sm text-muted-foreground">No users found</p>
          }
        />
      </Card>
    </>
  );
}
