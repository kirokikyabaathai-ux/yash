-- Row-Level Security (RLS) Policies for leads table
-- Requirements: 8.1, 8.2, 8.3, 8.4

-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin full access
-- Admins can perform all operations on all leads
CREATE POLICY "Admin full access" ON leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy 2: Office Team full access
-- Office Team members can perform all operations on all leads
CREATE POLICY "Office full access" ON leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'office'
    )
  );

-- Policy 3: Agent can see and modify only their own leads
-- Agents can only access leads where they are the creator
CREATE POLICY "Agent own leads" ON leads
  FOR ALL
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- Policy 4: Customer can view only their linked lead
-- Customers can only view (SELECT) leads linked to their account
CREATE POLICY "Customer own lead" ON leads
  FOR SELECT
  USING (
    customer_account_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

-- Policy 5: Installer can view only assigned leads
-- Installers can only view (SELECT) leads assigned to them
CREATE POLICY "Installer assigned leads" ON leads
  FOR SELECT
  USING (
    installer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'installer'
    )
  );
