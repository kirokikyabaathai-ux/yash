/**
 * Admin Users Management Page
 * 
 * Allows admin to view, create, edit, and disable user accounts.
 * Refactored to use Penpot design system components.
 * 
 * Requirements: 1.2, 1.4, 6.1, 6.2, 6.3, 6.4
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Card } from '@/components/ui/organisms/Card';
import { PageLayout } from '@/components/layout/PageLayout';
import { usersColumns } from './columns';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 max-w-md">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="User Management"
          description="Manage user accounts, roles, and permissions across the system"
        >
          <Card
            header={{
              title: 'Users',
              actions: (
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Back to Dashboard
                </Link>
              ),
            }}
            padding="none"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                columns={usersColumns}
                data={users}
                sortable
                filterable
                keyExtractor={(row) => row.id}
                emptyState={
                  <p className="text-sm text-muted-foreground">No users found</p>
                }
              />
            )}
          </Card>
        </PageLayout>
      </div>
    </div>
  );
}
