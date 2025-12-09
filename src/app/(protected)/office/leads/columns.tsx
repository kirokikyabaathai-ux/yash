'use client';

import { type Column } from '@/components/ui/organisms/DataTable';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import Link from 'next/link';

export const officeLeadsColumns: Column<any>[] = [
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
    key: 'email',
    header: 'Email',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <LeadStatusBadge status={value} />,
  },
  {
    key: 'current_step',
    header: 'Current Step',
    render: (value) => value?.step_name || 'N/A',
  },
  {
    key: 'created_at',
    header: 'Created At',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'id',
    header: 'Actions',
    render: (value) => (
      <Link
        href={`/office/leads/${value}`}
        className="text-sm text-primary hover:text-primary/80 transition-colors"
      >
        View
      </Link>
    ),
  },
];
