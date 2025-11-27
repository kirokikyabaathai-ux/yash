-- ============================================================================
-- Migration: Update Lead Status Labels
-- Date: 2025-11-24
-- Description: Update lead status values to be more descriptive and user-friendly
-- ============================================================================

-- Step 1: Add new status values to the CHECK constraint
ALTER TABLE leads 
DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
ADD CONSTRAINT leads_status_check 
CHECK (status IN (
  'inquiry',                    -- Was: 'ongoing'
  'documentation_pending',      -- New intermediate status
  'application_submitted',      -- Was: 'interested'
  'in_progress',               -- New status for active projects
  'completed',                 -- Was: 'closed'
  'withdrawn',                 -- Was: 'not_interested'
  -- Keep old values temporarily for migration
  'ongoing', 'interested', 'closed', 'not_interested'
));

-- Step 2: Migrate existing data
UPDATE leads SET status = 'inquiry' WHERE status = 'ongoing';
UPDATE leads SET status = 'application_submitted' WHERE status = 'interested';
UPDATE leads SET status = 'completed' WHERE status = 'closed';
UPDATE leads SET status = 'withdrawn' WHERE status = 'not_interested';

-- Step 3: Remove old status values from constraint
ALTER TABLE leads 
DROP CONSTRAINT leads_status_check;

ALTER TABLE leads
ADD CONSTRAINT leads_status_check 
CHECK (status IN (
  'inquiry',
  'documentation_pending',
  'application_submitted',
  'in_progress',
  'completed',
  'withdrawn'
));

-- Step 4: Update default value
ALTER TABLE leads 
ALTER COLUMN status SET DEFAULT 'inquiry';

-- Add comment for documentation
COMMENT ON COLUMN leads.status IS 'Lead status: inquiry (initial contact), documentation_pending (gathering docs), application_submitted (ready for processing), in_progress (active project), completed (finished), withdrawn (customer declined)';
