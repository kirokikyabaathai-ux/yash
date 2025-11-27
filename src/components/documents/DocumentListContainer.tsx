/**
 * Document List Container
 * Fetches and displays documents for a lead
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DocumentList } from './DocumentList';
import { Database } from '@/types/database';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentListContainerProps {
  leadId: string;
  userRole: string;
}

export function DocumentListContainer({ leadId, userRole }: DocumentListContainerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
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
      alert('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

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
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const handleMarkCorrupted = async (documentId: string) => {
    if (!confirm('Mark this document as corrupted?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'corrupted' })
        .eq('id', documentId);

      if (error) throw error;

      fetchDocuments();
    } catch (error) {
      console.error('Mark corrupted error:', error);
      alert('Failed to mark document as corrupted');
    }
  };

  return (
    <DocumentList
      documents={documents}
      canManage={canManage}
      isLoading={loading}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onMarkCorrupted={handleMarkCorrupted}
    />
  );
}
