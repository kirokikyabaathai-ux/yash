/**
 * Lead Detail Component
 * 
 * Displays complete information for a single lead using Penpot design system components.
 * 
 * Requirements: 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3
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
import { penpotSpacing, penpotTypography } from '@/lib/design-system/tokens';

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
      <CardHeader style={{ padding: penpotSpacing[6] }}>
        <div className="flex justify-between items-start">
          <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[2] }}>
            <CardTitle style={{ 
              fontSize: penpotTypography.headings.h2.fontSize,
              fontWeight: penpotTypography.headings.h2.fontWeight
            }}>
              {lead.customer_name}
            </CardTitle>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div style={{ display: 'flex', gap: penpotSpacing[2] }}>
            {canEdit && onEdit && (
              <Button variant="outline" size="md" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button variant="outline" size="md" className="text-red-600 hover:text-red-700" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent style={{ 
        padding: penpotSpacing[6],
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: penpotSpacing[8]
      }}>
        {/* Contact Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[4] }}>
          <h3 style={{ 
            fontSize: penpotTypography.headings.h4.fontSize,
            fontWeight: penpotTypography.headings.h4.fontWeight
          }}>
            Contact Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2" style={{ gap: penpotSpacing[4] }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Phone
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight
              }}>
                {lead.phone}
              </dd>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Email
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight
              }}>
                {lead.email || 'Not provided'}
              </dd>
            </div>

            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Address
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight
              }}>
                {lead.address}
              </dd>
            </div>
          </dl>
        </div>

        {/* Project Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[4] }}>
          <h3 style={{ 
            fontSize: penpotTypography.headings.h4.fontSize,
            fontWeight: penpotTypography.headings.h4.fontWeight
          }}>
            Project Details
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2" style={{ gap: penpotSpacing[4] }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Source
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight,
                textTransform: 'capitalize'
              }}>
                {lead.source}
              </dd>
            </div>

            {lead.notes && (
              <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
                <dt style={{ 
                  fontSize: penpotTypography.labels.small.fontSize,
                  fontWeight: penpotTypography.labels.small.fontWeight,
                  color: 'var(--penpot-neutral-secondary)'
                }}>
                  Notes
                </dt>
                <dd style={{ 
                  fontSize: penpotTypography.body.regular.fontSize,
                  fontWeight: penpotTypography.body.regular.fontWeight,
                  whiteSpace: 'pre-wrap'
                }}>
                  {lead.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[4] }}>
          <h3 style={{ 
            fontSize: penpotTypography.headings.h4.fontSize,
            fontWeight: penpotTypography.headings.h4.fontWeight
          }}>
            Metadata
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2" style={{ gap: penpotSpacing[4] }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Created At
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight
              }}>
                {formatDate(lead.created_at)}
              </dd>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                Last Updated
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight
              }}>
                {formatDate(lead.updated_at)}
              </dd>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: penpotSpacing[1] }}>
              <dt style={{ 
                fontSize: penpotTypography.labels.small.fontSize,
                fontWeight: penpotTypography.labels.small.fontWeight,
                color: 'var(--penpot-neutral-secondary)'
              }}>
                {(lead as any).customer_account?.customer_id ? 'Customer ID' : 'Lead ID'}
              </dt>
              <dd style={{ 
                fontSize: penpotTypography.body.regular.fontSize,
                fontWeight: penpotTypography.body.regular.fontWeight,
                fontFamily: 'monospace'
              }}>
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
            <Button variant="outline" size="md" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="outline" size="md" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
              Delete Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
