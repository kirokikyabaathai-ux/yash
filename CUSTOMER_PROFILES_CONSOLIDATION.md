# Customer Profiles Draft Consolidation

## Summary
Successfully consolidated the `customer_profile_drafts` table into `customer_profiles` by adding a `status` enum column with values 'draft' and 'submitted'. This simplifies the data model, eliminates the need for a separate drafts table, and provides better control over profile editing permissions.

## Changes Made

### 1. Database Migrations
- **Migration 1**: `consolidate_customer_profiles_drafts`
  - Added `is_draft` boolean column to `customer_profiles` (default: false)
  - Migrated existing draft data from `customer_profile_drafts` to `customer_profiles`
  - Dropped the `customer_profile_drafts` table

- **Migration 2**: `add_customer_profile_status_enum`
  - Created `customer_profile_status` enum with values: 'draft', 'submitted'
  - Added `status` column with enum type (default: 'draft')
  - Migrated data from `is_draft` boolean to `status` enum
  - Dropped the `is_draft` column

### 2. API Endpoints Updated

#### `/api/customer-profiles/draft/route.ts`
- **GET**: Now queries `customer_profiles` with `status = 'draft'` filter
- **POST**: Creates/updates records in `customer_profiles` with `status = 'draft'`
  - Returns 403 error if trying to edit a submitted profile
  - Only updates provided fields (partial updates supported)
- **DELETE**: Deletes draft records from `customer_profiles` where `status = 'draft'`

#### `/api/customer-profiles/route.ts`
- **POST**: Now checks for existing drafts and converts them to submitted profiles
- If a draft exists, it updates the draft and sets `status = 'submitted'`
- If no draft exists, it creates a new profile with `status = 'submitted'`
- Prevents duplicate submissions by checking for existing submitted profiles

### 3. Frontend Components Updated

#### `CustomerProfileForm.tsx`
- Updated draft loading to read from the new structure (direct fields instead of `draft_data` JSON)
- Modified validation to check both uploaded documents AND selected files
- Documents already uploaded are not required to be re-uploaded on submit
- Added `isSubmitted` state to track if profile is already submitted
- All form fields are disabled when `status = 'submitted'`
- Save Draft and Submit buttons are hidden when profile is submitted
- Shows informational banner when viewing a submitted profile

#### `client.tsx` (Form Wrapper)
- Updated submit handler to check for existing uploaded documents
- Only uploads new files that haven't been uploaded yet
- Reuses existing document paths for already uploaded files
- On final submit, documents are verified from the documents table, not from form data

### 4. TypeScript Types
- Regenerated `database.ts` with updated schema
- Removed `customer_profile_drafts` table types
- Added `customer_profile_status` enum type: `"draft" | "submitted"`
- Updated `customer_profiles` types to include `status: Database["public"]["Enums"]["customer_profile_status"]`

## Benefits

1. **Simplified Data Model**: Single table for both drafts and submitted profiles
2. **Better Data Integrity**: No need to sync between two tables
3. **Easier Queries**: Filter by `status` enum instead of joining tables
4. **Document Handling**: Documents uploaded during draft creation are preserved and reused on final submit
5. **No Duplicate Uploads**: System checks for existing documents before uploading
6. **Edit Protection**: Submitted profiles cannot be edited, preventing accidental changes
7. **Clear Status**: Enum provides explicit states ('draft' vs 'submitted') instead of boolean logic

## How It Works Now

### Saving a Draft
1. User fills partial form data
2. Documents can be uploaded immediately (stored in `documents` table)
3. Form data saved to `customer_profiles` with `status = 'draft'`
4. Draft can be loaded and updated multiple times
5. Attempting to edit a submitted profile returns 403 error

### Final Submission
1. System checks for existing draft by `lead_id` and `status = 'draft'`
2. Checks which documents are already uploaded
3. Only uploads new documents that haven't been uploaded yet
4. If draft exists: Updates the record and sets `status = 'submitted'`
5. If no draft: Creates new record with `status = 'submitted'`
6. Lead status updated to `lead_processing`
7. Once submitted, the profile becomes read-only

### Viewing a Submitted Profile
1. Form loads with all fields populated
2. All input fields are disabled
3. Blue informational banner shows "This customer profile has been submitted and cannot be edited"
4. Save Draft and Submit buttons are hidden
5. Only "Back" button is available

## Testing Recommendations

1. Test creating a new draft
2. Test loading an existing draft
3. Test updating a draft multiple times
4. Test submitting a draft (conversion to final profile)
5. Test submitting without a draft
6. Test document upload and reuse
7. Verify draft deletion works correctly
