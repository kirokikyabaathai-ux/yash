/**
 * Lead Detail Component
 * 
 * Displays complete information for a single lead using shadcn/ui components.
 * 
 * Requirements: 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

'use client';

import { useState } from 'react';
import type { Lead } from '@/types/api';
import { LeadStatusBadge } from './LeadStatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LeadDetailProps {
  lead: Lead;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function LeadDetail({
  lead,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: LeadDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-3xl">{lead.customer_name}</CardTitle>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-8">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Contact Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="text-sm font-normal text-foreground">{lead.phone}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm font-normal text-foreground">{lead.email || 'Not provided'}</dd>
            </div>

            <div className="md:col-span-2 space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
              <dd className="text-sm font-normal text-foreground">{lead.address}</dd>
            </div>
          </dl>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Project Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Source</dt>
              <dd className="text-sm font-normal text-foreground capitalize">{lead.source}</dd>
            </div>

            {lead.notes && (
              <div className="md:col-span-2 space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="text-sm font-normal text-foreground whitespace-pre-wrap">{lead.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Metadata</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="text-sm font-normal text-foreground">{formatDate(lead.created_at)}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
              <dd className="text-sm font-normal text-foreground">{formatDate(lead.updated_at)}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                {(lead as any).customer_account?.customer_id ? 'Customer ID' : 'Lead ID'}
              </dt>
              <dd className="text-sm font-mono font-normal text-foreground">
                {(lead as any).customer_account?.customer_id || lead.id}
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone and will also
              delete all associated documents, timeline steps, and activity logs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
