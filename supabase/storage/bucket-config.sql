-- Create storage bucket for solar project documents
-- This bucket will store all lead-related documents including:
-- - Mandatory documents (Aadhar, Bijli Bill, Bank Passbook, etc.)
-- - Optional documents
-- - Installation photos
-- - Customer uploads
-- - Admin documents

-- Create the solar-projects bucket as private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'solar-projects',
  'solar-projects',
  false, -- Private bucket, access controlled by RLS policies
  9437184, -- 9MB file size limit (9 * 1024 * 1024)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS policies for this bucket are defined in storage-policies.sql
