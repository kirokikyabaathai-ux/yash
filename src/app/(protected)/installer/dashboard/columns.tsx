'use client';

import { type Column } from '@/components/ui/organisms/DataTable';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Badge } from '@/components/ui/atoms';
import Link from 'next/link';

export const assignedLeadsColumns: Column<any>[] = [
  {
    key: 'customer_name',
    header: 'Customer',
    sortable: true,
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'address',
    header: 'Address',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <LeadStatusBadge status={value} />,
  },
  {
    key: 'id',
    header: 'Actions',
    render: (value) => (
      <Link
        href={`/installer/leads/${value}`}
        className="text-sm text-primary hover:text-primary/80 transition-colors"
      >
        View
      </Link>
    ),
  },
];

export const completedTasksColumns: Column<any>[] = [
  {
    key: 'step_master',
    header: 'Task',
    render: (value) => value?.step_name || 'Unknown Task',
  },
  {
    key: 'lead',
    header: 'Customer',
    render: (value) => value?.customer_name || 'N/A',
  },
  {
    key: 'completed_at',
    header: 'Completed At',
    sortable: true,
    render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <Badge variant="subtle" colorScheme="green">
        {value}
      </Badge>
    ),
  },
];
