-- Migration: Update Lead Status Values
-- Date: 2025-11-26
-- Description: Updates lead status enum values to new naming convention

-- Step 1: Drop the old constraint first
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Step 2: Update existing data to new status values
UPDATE leads 
SET status = CASE 
  WHEN status = 'inquiry' THEN 'lead'
  WHEN status = 'documentation_pending' THEN 'details_received'
  WHEN status = 'application_submitted' THEN 'lead_processing'
  WHEN status = 'in_progress' THEN 'lead_processing'
  WHEN status = 'completed' THEN 'lead_completed'
  WHEN status = 'withdrawn' THEN 'lead_cancelled'
  ELSE status
END;

-- Step 3: Add new constraint with updated status values
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
CHECK (status = ANY (ARRAY[
  'lead'::text,
  'lead_interested'::text,
  'lead_processing'::text, 
  'lead_completed'::text, 
  'lead_cancelled'::text
]));

-- Step 4: Update the default value
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'lead'::text;

-- Step 5: Update the column comment
COMMENT ON COLUMN leads.status IS 'Lead status: lead (initial contact), lead_interested (customer agreed), lead_processing (form filled + active project), lead_completed (finished), lead_cancelled (declined/withdrew)';
