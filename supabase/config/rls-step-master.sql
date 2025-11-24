-- Row-Level Security (RLS) Policies for step_master table
-- Requirements: 8.5

-- Enable RLS on step_master table
ALTER TABLE step_master ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can read step_master
-- Everyone needs to see the timeline steps
CREATE POLICY "All users can read steps" ON step_master
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Policy 2: Only Admin can modify step_master
-- Only admins can INSERT, UPDATE, or DELETE step_master records
CREATE POLICY "Admin can modify steps" ON step_master
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
