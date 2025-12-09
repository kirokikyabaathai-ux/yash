/**
 * User List Component
 * 
 * Displays a table of users with actions to edit and disable/enable.
 * Uses Penpot design system components for consistent styling.
 * 
 * Requirements: 1.2, 1.4, 6.1, 6.2, 6.3
 */

'use client';

import type { Database } from '@/types/database';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { penpotTypography } from '@/lib/design-system/tokens';

type User = Database['public']['Tables']['users']['Row'];

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDisable: (userId: string, currentStatus: string) => void;
}

export function UserList({ users, onEdit, onDisable }: UserListProps) {
  const getRoleBadgeColor = (role: string): 'blue' | 'green' | 'yellow' | 'red' | 'gray' => {
    const colors: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
      admin: 'blue',
      office: 'blue',
      agent: 'green',
      installer: 'yellow',
      customer: 'gray',
    };
    return colors[role] || 'gray';
  };

  const getStatusBadgeColor = (status: string): 'green' | 'red' => {
    return status === 'active' ? 'green' : 'red';
  };

  return (
    <DataTable
      data={users}
      keyExtractor={(user) => user.id}
      columns={[
        {
          key: 'name',
          header: 'Name',
          render: (value, user) => (
            <span style={{ 
              fontWeight: penpotTypography.body.bold.fontWeight,
              fontSize: penpotTypography.body.regular.fontSize
            }}>
              {user.name}
            </span>
          ),
        },
        {
          key: 'email',
          header: 'Email',
          render: (value, user) => (
            <span style={{ 
              color: 'var(--penpot-neutral-secondary)',
              fontSize: penpotTypography.body.regular.fontSize
            }}>
              {user.email}
            </span>
          ),
        },
        {
          key: 'phone',
          header: 'Phone',
          render: (value, user) => (
            <span style={{ 
              color: 'var(--penpot-neutral-secondary)',
              fontSize: penpotTypography.body.regular.fontSize
            }}>
              {user.phone}
            </span>
          ),
        },
        {
          key: 'role',
          header: 'Role',
          render: (value, user) => (
            <Badge variant="solid" colorScheme={getRoleBadgeColor(user.role)} size="sm">
              {user.role}
            </Badge>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (value, user) => (
            <Badge variant="solid" colorScheme={getStatusBadgeColor(user.status)} size="sm">
              {user.status}
            </Badge>
          ),
        },
        {
          key: 'created_at',
          header: 'Created',
          render: (value, user) => (
            <span style={{ color: 'var(--penpot-neutral-secondary)' }}>
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          ),
        },
        {
          key: 'id',
          header: 'Actions',
          render: (value, user) => (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                }}
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
                colorScheme={user.status === 'active' ? 'red' : 'green'}
              >
                {user.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
            </div>
          ),
          className: 'text-right',
        },
      ]}
      emptyState={
        <div>
          <p style={{ 
            fontSize: penpotTypography.body.regular.fontSize,
            color: 'var(--penpot-neutral-secondary)'
          }}>
            No users found. Create your first user to get started.
          </p>
        </div>
      }
    />
  );
}
