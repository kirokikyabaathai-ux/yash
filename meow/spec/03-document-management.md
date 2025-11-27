# Document Management

## Mandatory Documents
Required for lead validation:
1. Aadhar Front
2. Aadhar Back
3. Bijli Bill
4. Bank Passbook
5. Cancelled Cheque
6. PAN Card

**Lead cannot move to Lead Processing without them.**

## Optional Documents
- ITR (multiple)
- Other documents (multiple)

## Storage Structure (Supabase)
```
bucket: solar-projects

/leads/{lead_id}/mandatory/
/leads/{lead_id}/optional/
/leads/{lead_id}/installer/
/leads/{lead_id}/customer/
/leads/{lead_id}/admin/
```

Files uploaded under respective folders.

## File Upload via Signed URLs

### Backend Process
Backend generates:
```
createSignedUploadUrl("leads/{lead_id}/{type}/{uuid}.png")
```

### Roles Permitted to Upload
- Admin
- Office
- Agent (own leads only)
- Customer (customer-upload steps only)
- Installer (installation-only)

## Corrupted File Handling

### Process
1. Admin/office marks file as:
   ```
   document_status = corrupted
   ```

2. System creates new timeline step:
   ```
   Customer re-upload required
   ```

3. Customer gets upload button

## Upload Flow
1. Customer/Agent/Office clicks "Upload"
2. Next.js calls: `POST /api/documents/upload-link`
3. API Route calls Supabase Edge Function: `get-upload-url.ts`
4. Supabase returns signed URL + file path
5. Next.js uploads file directly to signed URL:
   ```
   await fetch(uploadUrl, { method: "PUT", body: file })
   ```
6. Backend stores file metadata in DB
