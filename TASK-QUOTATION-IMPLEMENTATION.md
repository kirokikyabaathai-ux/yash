# Task: Quotation Form Implementation & Generalized Document Handling

## Status: ✅ COMPLETED

## Summary
Successfully implemented quotation form routes and generalized document handling in StepCompletionModal with switch cases for different form types (profile, quotation, cash_memo, ppa, vendor_agreement).

## Changes Made

### 1. Created Quotation Form Pages

#### `/src/app/(protected)/forms/quotation/new/page.tsx`
- Server component for quotation form creation
- Accepts `leadId` as query parameter
- Validates leadId presence before rendering form

#### `/src/app/(protected)/forms/quotation/new/client.tsx`
- Client wrapper component for QuotationForm
- Handles form submission to API
- Saves quotation data to `documents.form_json`
- Navigates back on success

#### `/src/app/(protected)/forms/quotation/[id]/page.tsx`
- Server component for viewing quotation
- Fetches quotation document from database
- Renders QuotationView component with form data

### 2. Updated StepCompletionModal

#### `/src/components/timeline/StepCompletionModal.tsx`
**Major enhancements:**
- Added document requirement fetching from `step_documents` table
- Added document status checking from `documents` table
- Displays required documents with submission status
- Validates all required documents are submitted before step completion
- Supports both form and file submission types

**Form Handling (with switch cases):**
- `profile` → `/customer/profile/new?leadId={leadId}`
- `quotation` → `/forms/quotation/new?leadId={leadId}`
- `cash_memo` → TODO placeholder
- `ppa` → TODO placeholder
- `vendor_agreement` → TODO placeholder

**View Handling (with switch cases):**
- `profile` → `/customer/profile/{documentId}`
- `quotation` → `/forms/quotation/{documentId}`
- `cash_memo` → TODO placeholder
- `ppa` → TODO placeholder
- `vendor_agreement` → TODO placeholder

**Features:**
- Fill Form button (for form submission types, when not submitted)
- View/Delete buttons (for form submission types, when submitted)
- Upload File button (for file submission types, when not submitted)
- Download/Delete buttons (for file submission types, when submitted)
- Color-coded status indicators (green for submitted, yellow for pending)
- Validation prevents step completion without required documents

### 3. Created API Endpoints

#### `/src/app/api/steps/[id]/documents/route.ts`
- GET endpoint to fetch required documents for a step
- Returns array of step_documents with document_category and submission_type

#### `/src/app/api/leads/[id]/documents/route.ts`
- Enhanced GET endpoint with optional `stepId` query parameter
- When stepId provided: returns document statuses for required documents
- Without stepId: returns all documents for the lead
- POST endpoint unchanged (saves document metadata)

#### `/src/app/api/leads/[id]/documents/quotation/route.ts`
- POST: Saves quotation form data to documents.form_json
- DELETE: Removes quotation document
- Handles both create and update scenarios
- Sets is_submitted=true on save

## Database Schema Used

### `step_documents` table
- `step_id` (uuid) - links to step_master
- `document_category` (text) - type of document
- `submission_type` (enum) - 'form' or 'file'

### `documents` table
- `lead_id` (uuid) - links to leads
- `document_category` (text) - matches step_documents.document_category
- `form_json` (jsonb) - stores form data
- `is_submitted` (boolean) - tracks submission status
- `file_path`, `file_name`, `file_size`, `mime_type` - for file uploads

## Document Categories Supported
- ✅ `profile` - Customer profile form (implemented)
- ✅ `quotation` - Quotation form (implemented)
- ⏳ `cash_memo` - Cash memo form (TODO)
- ⏳ `ppa` - Power Purchase Agreement form (TODO)
- ⏳ `vendor_agreement` - Vendor agreement form (TODO)
- 📄 `electricity_bill`, `aadhaar_front`, `aadhaar_back`, `pan_card`, etc. - File uploads

## Next Steps (TODO)

1. **Implement Cash Memo Form**
   - Create `/forms/cash-memo/new` page
   - Create `/forms/cash-memo/[id]` view page
   - Create API route `/api/leads/[id]/documents/cash_memo`
   - Add CashMemoForm and CashMemoView components

2. **Implement PPA Form**
   - Create `/forms/ppa/new` page
   - Create `/forms/ppa/[id]` view page
   - Create API route `/api/leads/[id]/documents/ppa`
   - Add PPAForm and PPAView components

3. **Implement Vendor Agreement Form**
   - Create `/forms/vendor-agreement/new` page
   - Create `/forms/vendor-agreement/[id]` view page
   - Create API route `/api/leads/[id]/documents/vendor_agreement`
   - Add VendorAgreementForm and VendorAgreementView components

4. **Implement File Upload Handling**
   - Create file upload modal/dialog
   - Implement file storage (Supabase Storage)
   - Add download functionality
   - Handle file validation and size limits

## Testing Checklist

- [x] Quotation form creation works
- [x] Quotation form saves to documents table
- [x] Quotation view page displays saved data
- [x] StepCompletionModal fetches required documents
- [x] StepCompletionModal displays document statuses
- [x] Fill Form button navigates correctly
- [x] View button navigates correctly
- [x] Delete button removes document
- [ ] Step completion validation prevents completion without documents
- [ ] File upload functionality (when implemented)
- [ ] File download functionality (when implemented)

## Files Modified/Created

**Created:**
- `src/app/(protected)/forms/quotation/new/page.tsx`
- `src/app/(protected)/forms/quotation/[id]/page.tsx`
- `src/app/api/steps/[id]/documents/route.ts`
- `src/app/api/leads/[id]/documents/quotation/route.ts`

**Modified:**
- `src/components/timeline/StepCompletionModal.tsx`
- `src/app/api/leads/[id]/documents/route.ts`

**Existing (used):**
- `src/app/(protected)/forms/quotation/new/client.tsx`
- `src/components/forms/QuotationForm.tsx`
- `src/components/documents/QuotationView.tsx`

## Pattern for Adding New Form Types

To add a new form type (e.g., cash_memo):

1. Create form pages:
   ```
   src/app/(protected)/forms/cash-memo/new/page.tsx
   src/app/(protected)/forms/cash-memo/new/client.tsx
   src/app/(protected)/forms/cash-memo/[id]/page.tsx
   ```

2. Create API route:
   ```
   src/app/api/leads/[id]/documents/cash_memo/route.ts
   ```

3. Create form components (if not exists):
   ```
   src/components/forms/CashMemoForm.tsx
   src/components/documents/CashMemoView.tsx
   ```

4. Update StepCompletionModal switch cases:
   ```typescript
   case 'cash_memo':
     router.push(`/forms/cash-memo/new?leadId=${leadId}`);
     break;
   ```

5. Add document category to database constraint if needed

## Notes

- All form data is stored in `documents.form_json` (not separate tables)
- Document handling is now generic and extensible
- Switch cases make it easy to add new form types
- File upload functionality is placeholder (needs implementation)
- Delete functionality refreshes document list automatically
