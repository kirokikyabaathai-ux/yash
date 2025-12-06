/**
 * User List Component
 * 
 * Displays a table of users with actions to edit and disable/enable.
 * Requirements: 1.2, 1.4
 */

'use client';

import type { Database } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type User = Database['public']['Tables']['users']['Row'];

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDisable: (userId: string, currentStatus: string) => void;
}

export function UserList({ users, onEdit, onDisable }: UserListProps) {
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      office: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      installer: 'bg-yellow-100 text-yellow-800',
      customer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <DataTable
      data={users}
      keyExtractor={(user) => user.id}
      emptyMessage="No users found. Create your first user to get started."
      columns={[
        {
          header: 'Name',
          accessor: (user) => (
            <span className="font-medium text-foreground">{user.name}</span>
          ),
        },
        {
          header: 'Email',
          accessor: (user) => (
            <span className="text-muted-foreground">{user.email}</span>
          ),
        },
        {
          header: 'Phone',
          accessor: (user) => (
            <span className="text-muted-foreground">{user.phone}</span>
          ),
        },
        {
          header: 'Role',
          accessor: (user) => (
            <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
              {user.role}
            </Badge>
          ),
        },
        {
          header: 'Status',
          accessor: (user) => (
            <Badge variant="secondary" className={getStatusBadgeColor(user.status)}>
              {user.status}
            </Badge>
          ),
        },
        {
          header: 'Created',
          accessor: (user) => (
            <span className="text-muted-foreground">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          ),
        },
        {
          header: 'Actions',
          accessor: (user) => (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                }}
                className="hover:bg-accent"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDisable(user.id, user.status);
                }}
                className={
                  user.status === 'active'
                    ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                }
              >
                {user.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
            </div>
          ),
          className: 'text-right',
        },
      ]}
    />
  );
}
