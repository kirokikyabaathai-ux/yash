-- Leads table migration
-- Requirements: 2.1, 2.2, 3.3, 3.4

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  kw_requirement NUMERIC(10, 2),
  roof_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'interested', 'not_interested', 'closed')),
  created_by UUID REFERENCES users(id),
  customer_account_id UUID REFERENCES users(id),
  installer_id UUID REFERENCES users(id),
  source TEXT NOT NULL CHECK (source IN ('agent', 'office', 'customer', 'self')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_customer_account_id ON leads(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_leads_installer_id ON leads(installer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

-- Update timestamp trigger
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
