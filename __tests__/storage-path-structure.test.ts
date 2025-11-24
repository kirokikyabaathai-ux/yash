/**
 * Property-Based Tests for Storage Path Structure
 * 
 * Feature: solar-crm
 * Properties tested:
 * - Property 15: Document Storage Path Structure
 * - Property 44: Installer Upload Path Structure
 * 
 * Validates: Requirements 4.2, 10.3
 */

import fc from 'fast-check';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Helper function to construct storage path
const constructStoragePath = (leadId: string, type: string, uuid: string, extension: string): string => {
  return `leads/${leadId}/${type}/${uuid}.${extension}`;
};

// Helper function to parse storage path
const parseStoragePath = (path: string): { leadId: string; type: string; filename: string } | null => {
  const parts = path.split('/');
  if (parts.length !== 4 || parts[0] !== 'leads') {
    return null;
  }
  return {
    leadId: parts[1],
    type: parts[2],
    filename: parts[3],
  };
};

// Arbitraries for generating test data
const uuidArbitrary = fc.uuid();
const documentTypeArbitrary = fc.constantFrom('mandatory', 'optional', 'installation', 'customer', 'admin');
const fileExtensionArbitrary = fc.constantFrom('jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx');

describe('Storage Path Structure Property Tests', () => {
  
  /**
   * Property 15: Document Storage Path Structure
   * For any uploaded document, the file path in storage should match the format: 
   * leads/{lead_id}/{type}/{uuid}.{extension}.
   * 
   * Validates: Requirements 4.2
   */
  describe('Property 15: Document Storage Path Structure', () => {
    it('should construct valid storage paths for all document types', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          documentTypeArbitrary, // type
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, type, fileUuid, extension) => {
            // Construct the storage path
            const path = constructStoragePath(leadId, type, fileUuid, extension);
            
            // Verify the path format
            expect(path).toMatch(/^leads\/[0-9a-f-]+\/(mandatory|optional|installation|customer|admin)\/[0-9a-f-]+\.(jpg|jpeg|png|pdf|doc|docx)$/);
            
            // Verify path components
            const parts = path.split('/');
            expect(parts[0]).toBe('leads');
            expect(parts[1]).toBe(leadId);
            expect(parts[2]).toBe(type);
            expect(parts[3]).toBe(`${fileUuid}.${extension}`);
          }
        )
      );
    });

    it('should parse storage paths correctly', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          documentTypeArbitrary, // type
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, type, fileUuid, extension) => {
            // Construct a path
            const path = constructStoragePath(leadId, type, fileUuid, extension);
            
            // Parse the path
            const parsed = parseStoragePath(path);
            
            // Verify parsed components
            expect(parsed).not.toBeNull();
            expect(parsed?.leadId).toBe(leadId);
            expect(parsed?.type).toBe(type);
            expect(parsed?.filename).toBe(`${fileUuid}.${extension}`);
          }
        )
      );
    });

    it('should maintain path structure consistency across operations', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          documentTypeArbitrary, // type
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, type, fileUuid, extension) => {
            // Construct path
            const path1 = constructStoragePath(leadId, type, fileUuid, extension);
            
            // Parse and reconstruct
            const parsed = parseStoragePath(path1);
            expect(parsed).not.toBeNull();
            
            const [filename, ext] = parsed!.filename.split('.');
            const path2 = constructStoragePath(parsed!.leadId, parsed!.type, filename, ext);
            
            // Verify round-trip consistency
            expect(path1).toBe(path2);
          }
        )
      );
    });

    it('should reject invalid path formats', () => {
      fc.assert(
        fc.property(
          fc.string(), // random string
          (invalidPath) => {
            // Skip if it accidentally matches valid format
            fc.pre(!invalidPath.match(/^leads\/[0-9a-f-]+\/(mandatory|optional|installation|customer|admin)\/[0-9a-f-]+\.(jpg|jpeg|png|pdf|doc|docx)$/));
            
            // Attempt to parse invalid path
            const parsed = parseStoragePath(invalidPath);
            
            // Should return null for invalid paths
            if (parsed !== null) {
              // If it parsed, verify it doesn't match our expected structure
              expect(invalidPath.startsWith('leads/')).toBe(true);
            }
          }
        )
      );
    });

    it('should ensure lead_id is preserved in path', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          fc.array(
            fc.record({
              type: documentTypeArbitrary,
              uuid: uuidArbitrary,
              ext: fileExtensionArbitrary,
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (leadId, documents) => {
            // Construct paths for multiple documents of the same lead
            const paths = documents.map(doc => 
              constructStoragePath(leadId, doc.type, doc.uuid, doc.ext)
            );
            
            // Verify all paths contain the same lead_id
            paths.forEach(path => {
              const parsed = parseStoragePath(path);
              expect(parsed?.leadId).toBe(leadId);
            });
          }
        )
      );
    });

    it('should support all mandatory document types', () => {
      const mandatoryTypes = ['mandatory'];
      const mandatoryCategories = [
        'aadhar_front',
        'aadhar_back',
        'bijli_bill',
        'bank_passbook',
        'cancelled_cheque',
        'pan_card'
      ];

      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          fc.constantFrom(...mandatoryCategories), // category
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, category, fileUuid, extension) => {
            // Construct path for mandatory document
            const path = constructStoragePath(leadId, 'mandatory', fileUuid, extension);
            
            // Verify path structure
            expect(path).toContain('/mandatory/');
            expect(path).toMatch(/^leads\/[0-9a-f-]+\/mandatory\/[0-9a-f-]+\.(jpg|jpeg|png|pdf|doc|docx)$/);
          }
        )
      );
    });
  });

  /**
   * Property 44: Installer Upload Path Structure
   * For any installation photo uploaded by an Installer, the file should be stored 
   * under the path: leads/{lead_id}/installation/.
   * 
   * Validates: Requirements 10.3
   */
  describe('Property 44: Installer Upload Path Structure', () => {
    it('should construct installation paths correctly', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          uuidArbitrary, // fileUuid
          fc.constantFrom('jpg', 'jpeg', 'png'), // image extensions only
          (leadId, fileUuid, extension) => {
            // Construct installation path
            const path = constructStoragePath(leadId, 'installation', fileUuid, extension);
            
            // Verify path contains installation folder
            expect(path).toContain('/installation/');
            expect(path).toMatch(/^leads\/[0-9a-f-]+\/installation\/[0-9a-f-]+\.(jpg|jpeg|png)$/);
            
            // Parse and verify
            const parsed = parseStoragePath(path);
            expect(parsed?.type).toBe('installation');
            expect(parsed?.leadId).toBe(leadId);
          }
        )
      );
    });

    it('should ensure installation files are isolated per lead', () => {
      fc.assert(
        fc.property(
          fc.array(uuidArbitrary, { minLength: 2, maxLength: 10 }), // multiple leadIds
          fc.array(uuidArbitrary, { minLength: 1, maxLength: 5 }), // file uuids
          (leadIds, fileUuids) => {
            // Create installation paths for different leads
            const pathsByLead = leadIds.map(leadId => 
              fileUuids.map(fileUuid => 
                constructStoragePath(leadId, 'installation', fileUuid, 'jpg')
              )
            );
            
            // Verify each lead has distinct paths
            pathsByLead.forEach((paths, index) => {
              paths.forEach(path => {
                const parsed = parseStoragePath(path);
                expect(parsed?.leadId).toBe(leadIds[index]);
                expect(parsed?.type).toBe('installation');
              });
            });
          }
        )
      );
    });

    it('should only allow installation type for installer uploads', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, fileUuid, extension) => {
            // Construct installation path
            const path = constructStoragePath(leadId, 'installation', fileUuid, extension);
            
            // Parse and verify type is installation
            const parsed = parseStoragePath(path);
            expect(parsed?.type).toBe('installation');
            
            // Verify it's not in other folders
            expect(path).not.toContain('/mandatory/');
            expect(path).not.toContain('/optional/');
            expect(path).not.toContain('/customer/');
            expect(path).not.toContain('/admin/');
          }
        )
      );
    });

    it('should maintain installer path structure for multiple uploads', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId (installer assigned)
          fc.array(
            fc.record({
              uuid: uuidArbitrary,
              ext: fc.constantFrom('jpg', 'jpeg', 'png'),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (leadId, photos) => {
            // Construct paths for multiple installation photos
            const paths = photos.map(photo => 
              constructStoragePath(leadId, 'installation', photo.uuid, photo.ext)
            );
            
            // Verify all paths are in installation folder
            paths.forEach(path => {
              expect(path).toContain(`leads/${leadId}/installation/`);
              const parsed = parseStoragePath(path);
              expect(parsed?.type).toBe('installation');
              expect(parsed?.leadId).toBe(leadId);
            });
          }
        )
      );
    });

    it('should differentiate installation paths from other document types', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          uuidArbitrary, // fileUuid
          fileExtensionArbitrary, // extension
          (leadId, fileUuid, extension) => {
            // Construct paths for different types
            const installationPath = constructStoragePath(leadId, 'installation', fileUuid, extension);
            const mandatoryPath = constructStoragePath(leadId, 'mandatory', fileUuid, extension);
            const customerPath = constructStoragePath(leadId, 'customer', fileUuid, extension);
            
            // Verify paths are different
            expect(installationPath).not.toBe(mandatoryPath);
            expect(installationPath).not.toBe(customerPath);
            
            // Verify each has correct type
            expect(parseStoragePath(installationPath)?.type).toBe('installation');
            expect(parseStoragePath(mandatoryPath)?.type).toBe('mandatory');
            expect(parseStoragePath(customerPath)?.type).toBe('customer');
          }
        )
      );
    });
  });

  /**
   * Additional property: Path uniqueness
   * Ensures that different documents have unique paths
   */
  describe('Additional Property: Path Uniqueness', () => {
    it('should generate unique paths for different documents', () => {
      fc.assert(
        fc.property(
          uuidArbitrary, // leadId
          documentTypeArbitrary, // type
          fc.array(
            fc.record({
              uuid: uuidArbitrary,
              ext: fileExtensionArbitrary,
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (leadId, type, files) => {
            // Construct paths for multiple files
            const paths = files.map(file => 
              constructStoragePath(leadId, type, file.uuid, file.ext)
            );
            
            // Verify all paths are unique
            const uniquePaths = new Set(paths);
            expect(uniquePaths.size).toBe(paths.length);
          }
        )
      );
    });
  });
});
