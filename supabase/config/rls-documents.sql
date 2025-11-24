-- Row-Level Security (RLS) Policies for documents table
-- Requirements: 8.1, 8.2, 8.3, 8.4

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin full access
-- Admins can perform all operations on all documents
CREATE POLICY "Admin full access" ON documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy 2: Office Team full access
-- Office Team members can perform all operations on all documents
CREATE POLICY "Office full access" ON documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'office'
    )
  );

-- Policy 3: Agent can access documents for their leads
-- Agents can perform all operations on documents for leads they created
CREATE POLICY "Agent own lead documents" ON documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = documents.lead_id
      AND leads.created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- Policy 4: Customer can view and upload documents for their lead
-- Customers can SELECT and INSERT documents for their linked lead
CREATE POLICY "Customer own lead documents view" ON documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = documents.lead_id
      AND leads.customer_account_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

CREATE POLICY "Customer own lead documents upload" ON documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = documents.lead_id
      AND leads.customer_account_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

-- Policy 5: Installer can view installation documents only
-- Installers can only view (SELECT) installation-type documents for assigned leads
CREATE POLICY "Installer installation documents" ON documents
  FOR SELECT
  USING (
    type = 'installation'
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = documents.lead_id
      AND leads.installer_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'installer'
    )
  );

-- Policy 6: Installer can upload installation documents
-- Installers can INSERT installation-type documents for assigned leads
CREATE POLICY "Installer upload installation documents" ON documents
  FOR INSERT
  WITH CHECK (
    type = 'installation'
    AND EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = documents.lead_id
      AND leads.installer_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'installer'
    )
  );
