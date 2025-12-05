/**
 * Admin Users Management Page
 * 
 * Allows admin to view, create, edit, and disable user accounts.
 * Requirements: 1.2, 1.4
 */

'use client';

import { useState, useEffect } from 'react';
import { UserList } from '@/components/admin/UserList';
import { UserForm } from '@/components/admin/UserForm';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDisableUser = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage user accounts, roles, and permissions across the system
              </p>
            </div>
            <Button onClick={handleCreateUser} size="lg" className="shadow-md">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <UserList
            users={users}
            onEdit={handleEditUser}
            onDisable={handleDisableUser}
          />
        )}

        {showForm && (
          <UserForm
            user={editingUser}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </div>
  );
}
