-- PM Suryaghar Form table migration
-- Requirements: 5.1, 5.2

CREATE TABLE IF NOT EXISTS pm_suryaghar_form (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_email TEXT,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  aadhar_number TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_ifsc TEXT NOT NULL,
  additional_data JSONB,
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_pm_suryaghar_lead_id ON pm_suryaghar_form(lead_id);
