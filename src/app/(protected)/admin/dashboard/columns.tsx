'use client';

import { type Column } from '@/components/ui/organisms/DataTable';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Badge } from '@/components/ui/atoms';

export const leadsColumns: Column<any>[] = [
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
    key: 'status',
    header: 'Status',
    render: (value) => <LeadStatusBadge status={value} />,
  },
  {
    key: 'created_by_user',
    header: 'Created By',
    render: (value) => value?.name || 'N/A',
  },
  {
    key: 'created_at',
    header: 'Created At',
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export const usersColumns: Column<any>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'role',
    header: 'Role',
    render: (value) => (
      <Badge variant="subtle" colorScheme="gray">
        {value}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <Badge
        variant="subtle"
        colorScheme={value === 'active' ? 'green' : 'red'}
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    header: 'Created At',
    render: (value) => new Date(value).toLocaleDateString(),
  },
];
