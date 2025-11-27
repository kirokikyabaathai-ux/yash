-- Add installer assignment requirement to step_master
-- This allows admins to specify if a step requires installer assignment

ALTER TABLE step_master
ADD COLUMN IF NOT EXISTS requires_installer_assignment BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN step_master.requires_installer_assignment IS 'Indicates if this step requires an installer to be assigned to the lead';
