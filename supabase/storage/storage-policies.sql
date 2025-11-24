-- Row-Level Security (RLS) Policies for Supabase Storage
-- Bucket: solar-projects
-- 
-- Storage path structure:
-- /leads/{lead_id}/mandatory/{uuid}.{ext}
-- /leads/{lead_id}/optional/{uuid}.{ext}
-- /leads/{lead_id}/installation/{uuid}.{ext}
-- /leads/{lead_id}/customer/{uuid}.{ext}
-- /leads/{lead_id}/admin/{uuid}.{ext}

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADMIN POLICIES - Full access to all files
-- ============================================================================

-- Admin can view all files
CREATE POLICY "Admin can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin can upload files anywhere
CREATE POLICY "Admin can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin can update files
CREATE POLICY "Admin can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin can delete files
CREATE POLICY "Admin can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- OFFICE TEAM POLICIES - Full access to all files
-- ============================================================================

-- Office can view all files
CREATE POLICY "Office can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'office'
  )
);

-- Office can upload files anywhere
CREATE POLICY "Office can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'office'
  )
);

-- Office can update files
CREATE POLICY "Office can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'office'
  )
);

-- Office can delete files
CREATE POLICY "Office can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'office'
  )
);

-- ============================================================================
-- AGENT POLICIES - Access to own leads only
-- ============================================================================

-- Agent can view files for their own leads
CREATE POLICY "Agent can view own lead files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.created_by = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'agent'
  )
);

-- Agent can upload files to their own leads
CREATE POLICY "Agent can upload to own leads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.created_by = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'agent'
  )
);

-- Agent can update files for their own leads
CREATE POLICY "Agent can update own lead files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.created_by = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'agent'
  )
);

-- Agent can delete files for their own leads
CREATE POLICY "Agent can delete own lead files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.created_by = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'agent'
  )
);

-- ============================================================================
-- CUSTOMER POLICIES - Access to linked lead only, customer folder only
-- ============================================================================

-- Customer can view files for their linked lead
CREATE POLICY "Customer can view own lead files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'solar-projects'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.customer_account_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'customer'
  )
);

-- Customer can upload files only to customer folder of their linked lead
CREATE POLICY "Customer can upload to own lead customer folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'customer'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.customer_account_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'customer'
  )
);

-- Customer can update their own uploaded files
CREATE POLICY "Customer can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'customer'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.customer_account_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'customer'
  )
);

-- Customer can delete their own uploaded files
CREATE POLICY "Customer can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'customer'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.customer_account_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'customer'
  )
);

-- ============================================================================
-- INSTALLER POLICIES - Access to assigned leads, installation folder only
-- ============================================================================

-- Installer can view installation files for assigned leads
CREATE POLICY "Installer can view installation files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'installation'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.installer_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'installer'
  )
);

-- Installer can upload files only to installation folder of assigned leads
CREATE POLICY "Installer can upload installation files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'installation'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.installer_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'installer'
  )
);

-- Installer can update their own installation files
CREATE POLICY "Installer can update installation files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'installation'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.installer_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'installer'
  )
);

-- Installer can delete their own installation files
CREATE POLICY "Installer can delete installation files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'solar-projects'
  AND (string_to_array(name, '/'))[3] = 'installation'
  AND EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id::text = (string_to_array(name, '/'))[2]
    AND leads.installer_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'installer'
  )
);
