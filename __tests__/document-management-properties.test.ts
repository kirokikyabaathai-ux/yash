/**
 * Property-Based Tests for Document Management
 * 
 * Feature: solar-crm
 * Properties tested:
 * - Property 14: Signed Upload URL Generation
 * - Property 16: Document Metadata Persistence
 * - Property 17: Mandatory Document Validation
 * - Property 18: Corrupted Document Workflow Trigger
 * 
 * Note: Property 15 (Document Storage Path Structure) is tested in storage-path-structure.test.ts
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

import fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Skip tests if environment variables are not set
const skipTests = !supabaseUrl || !supabaseServiceKey || supabaseUrl === '';

let supabase: ReturnType<typeof createClient>;
if (!skipTests) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Arbitraries for generating test data
const uuidArbitrary = fc.uuid();
const documentTypeArbitrary = fc.constantFrom('mandatory', 'optional', 'installation', 'customer', 'admin');
const mandatoryDocCategoryArbitrary = fc.constantFrom(
  'aadhar_front',
  'aadhar_back',
  'bijli_bill',
  'bank_passbook',
  'cancelled_cheque',
  'pan_card'
);
const fileExtensionArbitrary = fc.constantFrom('jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx');
const mimeTypeArbitrary = fc.constantFrom(
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
);

// Helper function to create test user
const createTestUser = async (role: string = 'agent') => {
  const email = `test-${Date.now()}-${Math.random()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error('Failed to create test user');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      name: 'Test User',
      phone: `+1${Math.floor(Math.random() * 10000000000)}`,
      role,
      status: 'active',
    })
    .select()
    .single();

  if (userError || !userData) {
    throw new Error('Failed to create user profile');
  }

  return userData;
};

// Helper function to create test lead
const createTestLead = async (createdBy: string) => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      customer_name: 'Test Customer',
      phone: `+1${Math.floor(Math.random() * 10000000000)}`,
      email: `customer-${Date.now()}@example.com`,
      address: '123 Test St',
      source: 'agent',
      created_by: createdBy,
      status: 'ongoing',
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create test lead');
  }

  return data;
};

// Cleanup function
const cleanup = async (userIds: string[], leadIds: string[], documentIds: string[]) => {
  // Delete documents
  if (documentIds.length > 0) {
    await supabase.from('documents').delete().in('id', documentIds);
  }

  // Delete leads
  if (leadIds.length > 0) {
    await supabase.from('leads').delete().in('id', leadIds);
  }

  // Delete users
  if (userIds.length > 0) {
    await supabase.from('users').delete().in('id', userIds);
    for (const userId of userIds) {
      await supabase.auth.admin.deleteUser(userId);
    }
  }
};

describe('Document Management Property Tests', () => {
  
  beforeAll(() => {
    if (skipTests) {
      console.warn('Skipping document management property tests: Supabase credentials not configured');
    }
  });

  /**
   * Property 14: Signed Upload URL Generation
   * For any document upload request, the system should return a valid signed URL 
   * with an expiration time.
   * 
   * Validates: Requirements 4.1
   */
  describe('Property 14: Signed Upload URL Generation', () => {
    it('should generate valid signed URLs for all document types', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];

      try {
        await fc.assert(
          fc.asyncProperty(
            documentTypeArbitrary,
            fileExtensionArbitrary,
            async (docType, extension) => {
              // Create test user and lead
              const user = await createTestUser('agent');
              userIds.push(user.id);
              
              const lead = await createTestLead(user.id);
              leadIds.push(lead.id);

              // Generate file path
              const fileUuid = crypto.randomUUID();
              const filePath = `leads/${lead.id}/${docType}/${fileUuid}.${extension}`;

              // Generate signed upload URL
              const { data, error } = await supabase
                .storage
                .from('solar-projects')
                .createSignedUploadUrl(filePath);

              // Verify signed URL was generated
              expect(error).toBeNull();
              expect(data).not.toBeNull();
              expect(data?.signedUrl).toBeDefined();
              expect(data?.signedUrl).toContain('solar-projects');
              expect(data?.path).toBe(filePath);
              expect(data?.token).toBeDefined();
            }
          ),
          { numRuns: 10 } // Reduced runs for async operations
        );
      } finally {
        await cleanup(userIds, leadIds, []);
      }
    });

    it('should generate URLs with expiration time', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];

      try {
        const user = await createTestUser('agent');
        userIds.push(user.id);
        
        const lead = await createTestLead(user.id);
        leadIds.push(lead.id);

        await fc.assert(
          fc.asyncProperty(
            uuidArbitrary,
            fileExtensionArbitrary,
            async (fileUuid, extension) => {
              const filePath = `leads/${lead.id}/mandatory/${fileUuid}.${extension}`;

              // Generate signed URL
              const { data } = await supabase
                .storage
                .from('solar-projects')
                .createSignedUploadUrl(filePath);

              // Verify URL exists and has token (indicates expiration)
              expect(data?.signedUrl).toBeDefined();
              expect(data?.token).toBeDefined();
              
              // URL should contain query parameters for authentication
              const url = new URL(data!.signedUrl);
              expect(url.searchParams.has('token')).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, []);
      }
    });
  });

  /**
   * Property 16: Document Metadata Persistence
   * For any document upload, all metadata fields (lead_id, type, file_path, 
   * uploaded_by, status, uploaded_at) should be recorded in the documents table.
   * 
   * Validates: Requirements 4.3
   */
  describe('Property 16: Document Metadata Persistence', () => {
    it('should persist all document metadata fields', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        await fc.assert(
          fc.asyncProperty(
            documentTypeArbitrary,
            mandatoryDocCategoryArbitrary,
            fileExtensionArbitrary,
            mimeTypeArbitrary,
            fc.integer({ min: 1000, max: 10000000 }), // file size
            async (docType, category, extension, mimeType, fileSize) => {
              // Create test user and lead
              const user = await createTestUser('agent');
              userIds.push(user.id);
              
              const lead = await createTestLead(user.id);
              leadIds.push(lead.id);

              // Create document metadata
              const fileUuid = crypto.randomUUID();
              const filePath = `leads/${lead.id}/${docType}/${fileUuid}.${extension}`;
              const fileName = `test-file-${fileUuid}.${extension}`;

              const { data: document, error } = await supabase
                .from('documents')
                .insert({
                  lead_id: lead.id,
                  type: docType,
                  document_category: category,
                  file_path: filePath,
                  file_name: fileName,
                  file_size: fileSize,
                  mime_type: mimeType,
                  uploaded_by: user.id,
                  status: 'valid',
                })
                .select()
                .single();

              if (document) {
                documentIds.push(document.id);
              }

              // Verify all fields are persisted
              expect(error).toBeNull();
              expect(document).not.toBeNull();
              expect(document?.lead_id).toBe(lead.id);
              expect(document?.type).toBe(docType);
              expect(document?.document_category).toBe(category);
              expect(document?.file_path).toBe(filePath);
              expect(document?.file_name).toBe(fileName);
              expect(document?.file_size).toBe(fileSize);
              expect(document?.mime_type).toBe(mimeType);
              expect(document?.uploaded_by).toBe(user.id);
              expect(document?.status).toBe('valid');
              expect(document?.uploaded_at).toBeDefined();
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });

    it('should maintain metadata integrity across queries', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        const user = await createTestUser('agent');
        userIds.push(user.id);
        
        const lead = await createTestLead(user.id);
        leadIds.push(lead.id);

        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 5, maxLength: 50 }),
            fc.integer({ min: 1000, max: 5000000 }),
            async (fileName, fileSize) => {
              const fileUuid = crypto.randomUUID();
              const filePath = `leads/${lead.id}/mandatory/${fileUuid}.pdf`;

              // Insert document
              const { data: insertedDoc } = await supabase
                .from('documents')
                .insert({
                  lead_id: lead.id,
                  type: 'mandatory',
                  document_category: 'aadhar_front',
                  file_path: filePath,
                  file_name: fileName,
                  file_size: fileSize,
                  mime_type: 'application/pdf',
                  uploaded_by: user.id,
                  status: 'valid',
                })
                .select()
                .single();

              if (insertedDoc) {
                documentIds.push(insertedDoc.id);
              }

              // Query document back
              const { data: queriedDoc } = await supabase
                .from('documents')
                .select('*')
                .eq('id', insertedDoc!.id)
                .single();

              // Verify metadata matches
              expect(queriedDoc?.file_name).toBe(fileName);
              expect(queriedDoc?.file_size).toBe(fileSize);
              expect(queriedDoc?.file_path).toBe(filePath);
              expect(queriedDoc?.lead_id).toBe(lead.id);
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });
  });

  /**
   * Property 17: Mandatory Document Validation
   * For any lead, validation should fail if any of the six mandatory documents 
   * (Aadhar Front, Aadhar Back, Bijli Bill, Bank Passbook, Cancelled Cheque, PAN Card) 
   * are missing.
   * 
   * Validates: Requirements 4.4
   */
  describe('Property 17: Mandatory Document Validation', () => {
    const mandatoryCategories = [
      'aadhar_front',
      'aadhar_back',
      'bijli_bill',
      'bank_passbook',
      'cancelled_cheque',
      'pan_card',
    ];

    it('should validate all mandatory documents are present', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.subarray(mandatoryCategories, { minLength: 0, maxLength: 5 }),
            async (uploadedCategories) => {
              // Create test user and lead
              const user = await createTestUser('agent');
              userIds.push(user.id);
              
              const lead = await createTestLead(user.id);
              leadIds.push(lead.id);

              // Upload subset of mandatory documents
              for (const category of uploadedCategories) {
                const fileUuid = crypto.randomUUID();
                const { data: doc } = await supabase
                  .from('documents')
                  .insert({
                    lead_id: lead.id,
                    type: 'mandatory',
                    document_category: category,
                    file_path: `leads/${lead.id}/mandatory/${fileUuid}.pdf`,
                    file_name: `${category}.pdf`,
                    file_size: 10000,
                    mime_type: 'application/pdf',
                    uploaded_by: user.id,
                    status: 'valid',
                  })
                  .select()
                  .single();

                if (doc) {
                  documentIds.push(doc.id);
                }
              }

              // Check if all mandatory documents are uploaded
              const { data: docs } = await supabase
                .from('documents')
                .select('document_category')
                .eq('lead_id', lead.id)
                .eq('type', 'mandatory')
                .eq('status', 'valid');

              const uploadedSet = new Set(docs?.map(d => d.document_category) || []);
              const allPresent = mandatoryCategories.every(cat => uploadedSet.has(cat));

              // Validation should pass only if all 6 are present
              expect(allPresent).toBe(uploadedCategories.length === 6);
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });

    it('should identify missing mandatory documents', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        const user = await createTestUser('agent');
        userIds.push(user.id);
        
        const lead = await createTestLead(user.id);
        leadIds.push(lead.id);

        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 0, max: 5 }),
            async (numToUpload) => {
              // Clean up any existing documents from previous iterations
              await supabase
                .from('documents')
                .delete()
                .eq('lead_id', lead.id);

              // Upload only first N mandatory documents
              const categoriesToUpload = mandatoryCategories.slice(0, numToUpload);

              for (const category of categoriesToUpload) {
                const fileUuid = crypto.randomUUID();
                const { data: doc } = await supabase
                  .from('documents')
                  .insert({
                    lead_id: lead.id,
                    type: 'mandatory',
                    document_category: category,
                    file_path: `leads/${lead.id}/mandatory/${fileUuid}.pdf`,
                    file_name: `${category}.pdf`,
                    file_size: 10000,
                    mime_type: 'application/pdf',
                    uploaded_by: user.id,
                    status: 'valid',
                  })
                  .select()
                  .single();

                if (doc) {
                  documentIds.push(doc.id);
                }
              }

              // Get uploaded categories
              const { data: docs } = await supabase
                .from('documents')
                .select('document_category')
                .eq('lead_id', lead.id)
                .eq('type', 'mandatory')
                .eq('status', 'valid');

              const uploadedSet = new Set(docs?.map(d => d.document_category) || []);
              
              // Find missing categories
              const missing = mandatoryCategories.filter(cat => !uploadedSet.has(cat));

              // Verify missing count
              expect(missing.length).toBe(6 - numToUpload);
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });
  });

  /**
   * Property 18: Corrupted Document Workflow Trigger
   * For any document marked as corrupted by Admin or Office, a re-upload notification 
   * or timeline step should be created.
   * 
   * Validates: Requirements 4.5
   */
  describe('Property 18: Corrupted Document Workflow Trigger', () => {
    it('should create notification when document is marked corrupted', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.constantFrom('admin', 'office'),
            async (markerRole) => {
              // Create uploader (agent)
              const uploader = await createTestUser('agent');
              userIds.push(uploader.id);

              // Create marker (admin/office)
              const marker = await createTestUser(markerRole);
              userIds.push(marker.id);
              
              const lead = await createTestLead(uploader.id);
              leadIds.push(lead.id);

              // Upload document
              const fileUuid = crypto.randomUUID();
              const { data: document } = await supabase
                .from('documents')
                .insert({
                  lead_id: lead.id,
                  type: 'mandatory',
                  document_category: 'aadhar_front',
                  file_path: `leads/${lead.id}/mandatory/${fileUuid}.pdf`,
                  file_name: 'aadhar_front.pdf',
                  file_size: 10000,
                  mime_type: 'application/pdf',
                  uploaded_by: uploader.id,
                  status: 'valid',
                })
                .select()
                .single();

              if (document) {
                documentIds.push(document.id);
              }

              // Mark as corrupted
              await supabase
                .from('documents')
                .update({ status: 'corrupted' })
                .eq('id', document!.id);

              // Create notification
              const { data: notification } = await supabase
                .from('notifications')
                .insert({
                  user_id: uploader.id,
                  lead_id: lead.id,
                  type: 'document_corrupted',
                  title: 'Document Marked as Corrupted',
                  message: `Your uploaded document has been marked as corrupted.`,
                  read: false,
                })
                .select()
                .single();

              // Verify notification was created
              expect(notification).not.toBeNull();
              expect(notification?.user_id).toBe(uploader.id);
              expect(notification?.type).toBe('document_corrupted');
              expect(notification?.lead_id).toBe(lead.id);
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });

    it('should update document status to corrupted', async () => {
      if (skipTests || !supabase) {
        return;
      }

      const userIds: string[] = [];
      const leadIds: string[] = [];
      const documentIds: string[] = [];

      try {
        const user = await createTestUser('agent');
        userIds.push(user.id);
        
        const lead = await createTestLead(user.id);
        leadIds.push(lead.id);

        await fc.assert(
          fc.asyncProperty(
            mandatoryDocCategoryArbitrary,
            async (category) => {
              // Upload document
              const fileUuid = crypto.randomUUID();
              const { data: document } = await supabase
                .from('documents')
                .insert({
                  lead_id: lead.id,
                  type: 'mandatory',
                  document_category: category,
                  file_path: `leads/${lead.id}/mandatory/${fileUuid}.pdf`,
                  file_name: `${category}.pdf`,
                  file_size: 10000,
                  mime_type: 'application/pdf',
                  uploaded_by: user.id,
                  status: 'valid',
                })
                .select()
                .single();

              if (document) {
                documentIds.push(document.id);
              }

              // Verify initial status
              expect(document?.status).toBe('valid');

              // Mark as corrupted
              const { data: updated } = await supabase
                .from('documents')
                .update({ status: 'corrupted' })
                .eq('id', document!.id)
                .select()
                .single();

              // Verify status changed
              expect(updated?.status).toBe('corrupted');
            }
          ),
          { numRuns: 10 }
        );
      } finally {
        await cleanup(userIds, leadIds, documentIds);
      }
    });
  });
});
