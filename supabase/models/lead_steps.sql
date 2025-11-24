-- Lead Steps table migration
-- Requirements: 6.4, 7.2

CREATE TABLE IF NOT EXISTS lead_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES step_master(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'pending', 'completed')),
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  remarks TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, step_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_steps_lead_id ON lead_steps(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_steps_step_id ON lead_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_lead_steps_status ON lead_steps(status);

-- Update timestamp trigger
CREATE TRIGGER update_lead_steps_updated_at
  BEFORE UPDATE ON lead_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
