/**
 * Property-Based Tests for Supabase Edge Functions
 * 
 * These tests validate:
 * - Property 14: Signed Upload URL Generation (Requirement 4.1)
 * - Property 17: Mandatory Document Validation (Requirement 4.4)
 */

import * as fc from 'fast-check';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;

beforeAll(() => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  supabase = createClient(supabaseUrl, supabaseServiceKey);
});

describe('Edge Function Property Tests', () => {
  /**
   * Feature: solar-crm, Property 14: Signed Upload URL Generation
   * Validates: Requirements 4.1
   * 
   * For any document upload request, the system should return a valid signed URL with an expiration time.
   */
  describe('Property 14: Signed Upload URL Generation', () => {
    it('should generate valid signed upload URLs with expiration for any valid request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            leadId: fc.uuid(),
            documentType: fc.constantFrom('mandatory', 'optional', 'installation', 'customer', 'admin'),
            fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9_-]/g, '_')),
            fileExtension: fc.constantFrom('pdf', 'jpg', 'jpeg', 'png', 'webp'),
          }),
          async (uploadRequest) => {
            // Create a test user with admin role for permissions
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (authError || !authData.user) {
              throw new Error('Failed to create test user');
            }

            const userId = authData.user.id;

            try {
              // Create user profile with admin role
              await supabase.from('users').insert({
                id: userId,
                email: authData.user.email!,
                name: 'Test User',
                phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                role: 'admin',
                status: 'active',
              });

              // Create a test lead
              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert({
                  id: uploadRequest.leadId,
                  customer_name: 'Test Customer',
                  phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                  address: 'Test Address',
                  status: 'ongoing',
                  created_by: userId,
                  source: 'agent',
                })
                .select()
                .single();

              if (leadError) {
                throw new Error('Failed to create test lead');
              }

              // Get user session token
              const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
                email: authData.user.email!,
                password: 'TestPassword123!',
              });

              if (sessionError || !sessionData.session) {
                throw new Error('Failed to sign in test user');
              }

              // Call the get-upload-url edge function
              const response = await fetch(`${supabaseUrl}/functions/v1/get-upload-url`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${sessionData.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadRequest),
              });

              const result = await response.json();

              // Property: Should return a valid signed URL with expiration
              expect(response.status).toBe(200);
              expect(result.uploadUrl).toBeDefined();
              expect(typeof result.uploadUrl).toBe('string');
              expect(result.uploadUrl.length).toBeGreaterThan(0);
              
              expect(result.filePath).toBeDefined();
              expect(typeof result.filePath).toBe('string');
              // Verify path structure: leads/{leadId}/{documentType}/{uuid}.{extension}
              expect(result.filePath).toMatch(/^leads\/[a-f0-9-]+\/[a-z]+\/[a-f0-9-]+\.[a-z]+$/);
              
              expect(result.expiresAt).toBeDefined();
              expect(typeof result.expiresAt).toBe('number');
              // Expiration should be in the future
              expect(result.expiresAt).toBeGreaterThan(Date.now());
              // Expiration should be within reasonable time (e.g., 10 minutes)
              expect(result.expiresAt).toBeLessThan(Date.now() + 10 * 60 * 1000);

            } finally {
              // Cleanup: Delete test lead and user
              await supabase.from('leads').delete().eq('id', uploadRequest.leadId);
              await supabase.auth.admin.deleteUser(userId);
            }
          }
        ),
        { numRuns: 10 } // Reduced runs for edge function tests due to API rate limits
      );
    });
  });

  /**
   * Feature: solar-crm, Property 17: Mandatory Document Validation
   * Validates: Requirements 4.4
   * 
   * For any lead, validation should fail if any of the six mandatory documents 
   * (Aadhar Front, Aadhar Back, Bijli Bill, Bank Passbook, Cancelled Cheque, PAN Card) are missing.
   */
  describe('Property 17: Mandatory Document Validation', () => {
    it('should correctly identify missing mandatory documents for any lead', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            leadId: fc.uuid(),
            uploadedCategories: fc.subarray(
              ['aadhar_front', 'aadhar_back', 'bijli_bill', 'bank_passbook', 'cancelled_cheque', 'pan_card'],
              { minLength: 0, maxLength: 6 }
            ),
          }),
          async (testData) => {
            const mandatoryCategories = [
              'aadhar_front',
              'aadhar_back',
              'bijli_bill',
              'bank_passbook',
              'cancelled_cheque',
              'pan_card',
            ];

            // Create a test user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (authError || !authData.user) {
              throw new Error('Failed to create test user');
            }

            const userId = authData.user.id;

            try {
              // Create user profile
              await supabase.from('users').insert({
                id: userId,
                email: authData.user.email!,
                name: 'Test User',
                phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                role: 'admin',
                status: 'active',
              });

              // Create a test lead
              await supabase.from('leads').insert({
                id: testData.leadId,
                customer_name: 'Test Customer',
                phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                address: 'Test Address',
                status: 'ongoing',
                created_by: userId,
                source: 'agent',
              });

              // Upload documents for the selected categories
              const documentIds: string[] = [];
              for (const category of testData.uploadedCategories) {
                const docId = crypto.randomUUID();
                documentIds.push(docId);
                
                await supabase.from('documents').insert({
                  id: docId,
                  lead_id: testData.leadId,
                  type: 'mandatory',
                  document_category: category,
                  file_path: `leads/${testData.leadId}/mandatory/${docId}.pdf`,
                  file_name: `${category}.pdf`,
                  file_size: 1024,
                  mime_type: 'application/pdf',
                  uploaded_by: userId,
                  status: 'valid',
                });
              }

              // Get user session token
              const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
                email: authData.user.email!,
                password: 'TestPassword123!',
              });

              if (sessionError || !sessionData.session) {
                throw new Error('Failed to sign in test user');
              }

              // Call the document-validation edge function
              const lastDocId = documentIds[documentIds.length - 1] || crypto.randomUUID();
              const response = await fetch(`${supabaseUrl}/functions/v1/document-validation`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${sessionData.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  leadId: testData.leadId,
                  documentId: lastDocId,
                  fileName: 'test.pdf',
                  fileSize: 1024,
                  mimeType: 'application/pdf',
                }),
              });

              const result = await response.json();

              // Property: Should correctly identify if all mandatory documents are uploaded
              expect(response.status).toBe(200);
              expect(result.valid).toBe(true);
              
              const allUploaded = mandatoryCategories.every(cat => 
                testData.uploadedCategories.includes(cat)
              );
              expect(result.allMandatoryUploaded).toBe(allUploaded);

              // Property: Missing documents should be correctly identified
              const expectedMissing = mandatoryCategories.filter(cat => 
                !testData.uploadedCategories.includes(cat)
              );
              expect(result.missingDocuments).toEqual(expect.arrayContaining(expectedMissing));
              expect(result.missingDocuments.length).toBe(expectedMissing.length);

            } finally {
              // Cleanup: Delete test documents, lead, and user
              await supabase.from('documents').delete().eq('lead_id', testData.leadId);
              await supabase.from('leads').delete().eq('id', testData.leadId);
              await supabase.auth.admin.deleteUser(userId);
            }
          }
        ),
        { numRuns: 10 } // Reduced runs for edge function tests due to API rate limits
      );
    });

    it('should validate file type and size constraints', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            leadId: fc.uuid(),
            mimeType: fc.oneof(
              fc.constant('application/pdf'),
              fc.constant('image/jpeg'),
              fc.constant('image/png'),
              fc.constant('text/plain'), // Invalid type
              fc.constant('application/zip') // Invalid type
            ),
            fileSize: fc.integer({ min: 1, max: 15 * 1024 * 1024 }), // Up to 15MB
          }),
          async (testData) => {
            const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const maxFileSize = 10 * 1024 * 1024; // 10MB

            // Create a test user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              password: 'TestPassword123!',
              email_confirm: true,
            });

            if (authError || !authData.user) {
              throw new Error('Failed to create test user');
            }

            const userId = authData.user.id;

            try {
              // Create user profile
              await supabase.from('users').insert({
                id: userId,
                email: authData.user.email!,
                name: 'Test User',
                phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                role: 'admin',
                status: 'active',
              });

              // Create a test lead
              await supabase.from('leads').insert({
                id: testData.leadId,
                customer_name: 'Test Customer',
                phone: `+1${Math.floor(Math.random() * 10000000000)}`,
                address: 'Test Address',
                status: 'ongoing',
                created_by: userId,
                source: 'agent',
              });

              // Create a test document
              const docId = crypto.randomUUID();
              await supabase.from('documents').insert({
                id: docId,
                lead_id: testData.leadId,
                type: 'mandatory',
                document_category: 'aadhar_front',
                file_path: `leads/${testData.leadId}/mandatory/${docId}.pdf`,
                file_name: 'test.pdf',
                file_size: testData.fileSize,
                mime_type: testData.mimeType,
                uploaded_by: userId,
                status: 'valid',
              });

              // Get user session token
              const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
                email: authData.user.email!,
                password: 'TestPassword123!',
              });

              if (sessionError || !sessionData.session) {
                throw new Error('Failed to sign in test user');
              }

              // Call the document-validation edge function
              const response = await fetch(`${supabaseUrl}/functions/v1/document-validation`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${sessionData.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  leadId: testData.leadId,
                  documentId: docId,
                  fileName: 'test.pdf',
                  fileSize: testData.fileSize,
                  mimeType: testData.mimeType,
                }),
              });

              const result = await response.json();

              // Property: Should validate file type
              const isValidType = validMimeTypes.includes(testData.mimeType);
              const isValidSize = testData.fileSize <= maxFileSize;
              const shouldBeValid = isValidType && isValidSize;

              expect(response.status).toBe(200);
              expect(result.valid).toBe(shouldBeValid);

              if (!isValidType) {
                expect(result.error).toContain('Invalid file type');
              }

              if (!isValidSize) {
                expect(result.error).toContain('File size exceeds');
              }

            } finally {
              // Cleanup
              await supabase.from('documents').delete().eq('lead_id', testData.leadId);
              await supabase.from('leads').delete().eq('id', testData.leadId);
              await supabase.auth.admin.deleteUser(userId);
            }
          }
        ),
        { numRuns: 10 } // Reduced runs for edge function tests
      );
    });
  });
});
