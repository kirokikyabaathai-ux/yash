/**
 * User List Component
 * 
 * Displays a table of users with actions to edit and disable/enable.
 * Requirements: 1.2, 1.4
 */

'use client';

import type { Database } from '@/types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  if (users.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-muted-foreground text-lg">No users found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Create your first user to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-muted-foreground">{user.phone}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusBadgeColor(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDisable(user.id, user.status)}
                  className={
                    user.status === 'active'
                      ? 'text-destructive hover:text-destructive'
                      : 'text-green-600 hover:text-green-700'
                  }
                >
                  {user.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
