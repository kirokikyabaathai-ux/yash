-- Step Master table migration
-- Requirements: 6.1

CREATE TABLE IF NOT EXISTS step_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_name TEXT NOT NULL,
  order_index INTEGER NOT NULL UNIQUE,
  allowed_roles TEXT[] NOT NULL,
  remarks_required BOOLEAN DEFAULT FALSE,
  attachments_allowed BOOLEAN DEFAULT FALSE,
  customer_upload BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_step_master_order ON step_master(order_index);

-- Update timestamp trigger
CREATE TRIGGER update_step_master_updated_at
  BEFORE UPDATE ON step_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
