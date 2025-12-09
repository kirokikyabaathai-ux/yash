'use client';

import { type Column } from '@/components/ui/organisms/DataTable';
import { Badge } from '@/components/ui/atoms';

export const usersColumns: Column<any>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
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
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];
