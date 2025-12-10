/**
 * Document List Container
 * Fetches and displays documents for a lead
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DocumentList } from './DocumentList';
import { Database } from '@/types/database';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentListContainerProps {
  leadId: string;
  userRole: string;
}

export function DocumentListContainer({ leadId, userRole }: DocumentListContainerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const supabase = createClient();

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('lead_id', leadId)
      .order('uploaded_at', { ascending: false });

    console.log('Fetching documents for lead:', leadId);
    console.log('Documents data:', data);
    console.log('Documents error:', error);

    if (data && !error) {
      setDocuments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const canManage = ['admin', 'office', 'agent'].includes(userRole);

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('solar-projects')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = (documentId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Document',
      description: 'Are you sure you want to delete this document? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const doc = documents.find(d => d.id === documentId);
          if (!doc) return;

          // Delete from storage
          const { error: storageError } = await supabase
            .storage
            .from('solar-projects')
            .remove([doc.file_path]);

          if (storageError) throw storageError;

          // Delete from database
          const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId);

          if (dbError) throw dbError;

          fetchDocuments();
          toast.success('Document deleted successfully');
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete document');
        }
      },
    });
  };

  const handleMarkCorrupted = (documentId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Mark as Corrupted',
      description: 'Mark this document as corrupted? This will flag it for re-upload.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('documents')
            .update({ status: 'corrupted' })
            .eq('id', documentId);

          if (error) throw error;

          fetchDocuments();
          toast.success('Document marked as corrupted');
        } catch (error) {
          console.error('Mark corrupted error:', error);
          toast.error('Failed to mark document as corrupted');
        }
      },
    });
  };

  return (
    <>
      <DocumentList
        documents={documents}
        canManage={canManage}
        isLoading={loading}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onMarkCorrupted={handleMarkCorrupted}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </>
  );
}
