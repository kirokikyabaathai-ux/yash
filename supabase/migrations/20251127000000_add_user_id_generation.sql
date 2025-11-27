-- Migration: Add User ID Generation Logic
-- Date: 2025-11-27
-- Description: Adds visible ID columns and auto-generation logic for agents, offices, and customers
-- Format: YN + 8 digits + suffix (W for agent/office, C for customer)

-- Add visible ID columns for agents, offices, and customers
ALTER TABLE users 
ADD COLUMN agent_id TEXT,
ADD COLUMN office_id TEXT,
ADD COLUMN customer_id TEXT;

-- Add comments to explain the purpose
COMMENT ON COLUMN users.agent_id IS 'Visible ID for agents to display on website (Format: YN12345678W)';
COMMENT ON COLUMN users.office_id IS 'Visible ID for offices to display on website (Format: YN12345678W)';
COMMENT ON COLUMN users.customer_id IS 'Visible ID for customers to display on website (Format: YN12345678C)';

-- Function to generate unique ID with format YN + 8 digits + suffix
CREATE OR REPLACE FUNCTION generate_unique_user_id(role_type TEXT, suffix TEXT)
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
  max_attempts INT := 100;
  attempt INT := 0;
BEGIN
  LOOP
    -- Generate random 8-digit number
    new_id := 'YN' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0') || suffix;
    
    -- Check if ID already exists in the appropriate column
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM users WHERE %I = $1)', role_type)
    INTO id_exists
    USING new_id;
    
    -- If ID doesn't exist, return it
    IF NOT id_exists THEN
      RETURN new_id;
    END IF;
    
    -- Increment attempt counter
    attempt := attempt + 1;
    
    -- Prevent infinite loop
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique ID after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate IDs based on role
CREATE OR REPLACE FUNCTION auto_generate_user_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate agent_id for agents
  IF NEW.role = 'agent' AND NEW.agent_id IS NULL THEN
    NEW.agent_id := generate_unique_user_id('agent_id', 'W');
  END IF;
  
  -- Generate office_id for offices
  IF NEW.role = 'office' AND NEW.office_id IS NULL THEN
    NEW.office_id := generate_unique_user_id('office_id', 'W');
  END IF;
  
  -- Generate customer_id for customers
  IF NEW.role = 'customer' AND NEW.customer_id IS NULL THEN
    NEW.customer_id := generate_unique_user_id('customer_id', 'C');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before insert
CREATE TRIGGER trigger_auto_generate_user_ids
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_user_ids();

-- Add unique constraints to prevent duplicates
ALTER TABLE users ADD CONSTRAINT unique_agent_id UNIQUE (agent_id);
ALTER TABLE users ADD CONSTRAINT unique_office_id UNIQUE (office_id);
ALTER TABLE users ADD CONSTRAINT unique_customer_id UNIQUE (customer_id);
