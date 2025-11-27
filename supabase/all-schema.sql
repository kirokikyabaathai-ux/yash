-- Solar CRM Complete Database Schema
-- This file combines all table schemas in proper dependency order
-- Requirements: All database requirements

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp trigger function (used by multiple tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: users
-- Requirements: 1.2, 1.5
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'office', 'installer', 'customer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  assigned_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Update timestamp trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: leads
-- Requirements: 2.1, 2.2, 3.3, 3.4
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'lead_interested', 'lead_processing', 'lead_completed', 'lead_cancelled')),
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

-- ============================================================================
-- TABLE: documents
-- Requirements: 4.2, 4.3
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mandatory', 'optional', 'installation', 'customer', 'admin')),
  document_category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'corrupted', 'replaced')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- ============================================================================
-- TABLE: step_master
-- Requirements: 6.1
-- ============================================================================

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

-- ============================================================================
-- TABLE: lead_steps
-- Requirements: 6.4, 7.2
-- ============================================================================

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

-- ============================================================================
-- TABLE: pm_suryaghar_form
-- Requirements: 5.1, 5.2
-- ============================================================================

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

-- ============================================================================
-- TABLE: activity_log
-- Requirements: 12.1, 12.2, 12.3, 12.4
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_lead_id ON activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);

-- ============================================================================
-- TABLE: notifications
-- Requirements: 19.1, 19.2, 19.3
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================

-- ============================================================================
-- NOTIFICATION TRIGGERS
-- Requirements: 19.1, 19.2, 19.3
-- ============================================================================

-- Function to create notification for step completion
CREATE OR REPLACE FUNCTION notify_step_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_customer_id UUID;
  v_step_name TEXT;
  v_completed_by_name TEXT;
BEGIN
  -- Only trigger on status change to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the customer account ID from the lead
    SELECT customer_account_id INTO v_lead_customer_id
    FROM leads
    WHERE id = NEW.lead_id;

    -- Only create notification if there's a customer linked
    IF v_lead_customer_id IS NOT NULL THEN
      -- Get step name
      SELECT step_name INTO v_step_name
      FROM step_master
      WHERE id = NEW.step_id;

      -- Get completed by user name
      SELECT name INTO v_completed_by_name
      FROM users
      WHERE id = NEW.completed_by;

      -- Create notification
      INSERT INTO notifications (
        user_id,
        lead_id,
        type,
        title,
        message,
        read,
        created_at
      ) VALUES (
        v_lead_customer_id,
        NEW.lead_id,
        'step_completed',
        'Step Completed',
        'The step "' || v_step_name || '" has been completed by ' || COALESCE(v_completed_by_name, 'a team member') || '.',
        false,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for step completion
DROP TRIGGER IF EXISTS trigger_notify_step_completion ON lead_steps;
CREATE TRIGGER trigger_notify_step_completion
  AFTER INSERT OR UPDATE ON lead_steps
  FOR EACH ROW
  EXECUTE FUNCTION notify_step_completion();


-- Function to create notification for document corruption
CREATE OR REPLACE FUNCTION notify_document_corruption()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_customer_id UUID;
  v_document_category TEXT;
BEGIN
  -- Only trigger on status change to 'corrupted'
  IF NEW.status = 'corrupted' AND (OLD.status IS NULL OR OLD.status != 'corrupted') THEN
    -- Get the customer account ID from the lead
    SELECT customer_account_id INTO v_lead_customer_id
    FROM leads
    WHERE id = NEW.lead_id;

    -- Only create notification if there's a customer linked
    IF v_lead_customer_id IS NOT NULL THEN
      -- Create notification
      INSERT INTO notifications (
        user_id,
        lead_id,
        type,
        title,
        message,
        read,
        created_at
      ) VALUES (
        v_lead_customer_id,
        NEW.lead_id,
        'document_corrupted',
        'Document Re-upload Required',
        'The document "' || NEW.document_category || '" has been marked as corrupted. Please re-upload a clear copy.',
        false,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document corruption
DROP TRIGGER IF EXISTS trigger_notify_document_corruption ON documents;
CREATE TRIGGER trigger_notify_document_corruption
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_corruption();


-- Function to create notification for remarks addition
CREATE OR REPLACE FUNCTION notify_remarks_addition()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_customer_id UUID;
  v_step_name TEXT;
  v_completed_by_name TEXT;
BEGIN
  -- Only trigger when remarks are added (not null and different from old)
  IF NEW.remarks IS NOT NULL AND (OLD.remarks IS NULL OR OLD.remarks != NEW.remarks) THEN
    -- Get the customer account ID from the lead
    SELECT customer_account_id INTO v_lead_customer_id
    FROM leads
    WHERE id = NEW.lead_id;

    -- Only create notification if there's a customer linked
    IF v_lead_customer_id IS NOT NULL THEN
      -- Get step name
      SELECT step_name INTO v_step_name
      FROM step_master
      WHERE id = NEW.step_id;

      -- Get completed by user name (if available)
      IF NEW.completed_by IS NOT NULL THEN
        SELECT name INTO v_completed_by_name
        FROM users
        WHERE id = NEW.completed_by;
      END IF;

      -- Create notification
      INSERT INTO notifications (
        user_id,
        lead_id,
        type,
        title,
        message,
        read,
        created_at
      ) VALUES (
        v_lead_customer_id,
        NEW.lead_id,
        'remark_added',
        'New Remark Added',
        'A remark has been added to the step "' || v_step_name || '": ' || LEFT(NEW.remarks, 100) || CASE WHEN LENGTH(NEW.remarks) > 100 THEN '...' ELSE '' END,
        false,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for remarks addition
DROP TRIGGER IF EXISTS trigger_notify_remarks_addition ON lead_steps;
CREATE TRIGGER trigger_notify_remarks_addition
  AFTER INSERT OR UPDATE ON lead_steps
  FOR EACH ROW
  EXECUTE FUNCTION notify_remarks_addition();


-- Function to create notification for lead assignment (installer)
CREATE OR REPLACE FUNCTION notify_lead_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_installer_name TEXT;
  v_lead_name TEXT;
BEGIN
  -- Only trigger when installer_id is set or changed
  IF NEW.installer_id IS NOT NULL AND (OLD.installer_id IS NULL OR OLD.installer_id != NEW.installer_id) THEN
    -- Get lead name
    v_lead_name := NEW.customer_name;

    -- Create notification for the installer
    INSERT INTO notifications (
      user_id,
      lead_id,
      type,
      title,
      message,
      read,
      created_at
    ) VALUES (
      NEW.installer_id,
      NEW.id,
      'lead_assigned',
      'New Installation Assigned',
      'You have been assigned to install solar panels for ' || v_lead_name || '.',
      false,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lead assignment
DROP TRIGGER IF EXISTS trigger_notify_lead_assignment ON leads;
CREATE TRIGGER trigger_notify_lead_assignment
  AFTER INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_lead_assignment();

-- Add comments for documentation
COMMENT ON FUNCTION notify_step_completion() IS 'Creates notification when a step is completed for a customer';
COMMENT ON FUNCTION notify_document_corruption() IS 'Creates notification when a document is marked as corrupted';
COMMENT ON FUNCTION notify_remarks_addition() IS 'Creates notification when remarks are added to a step';
COMMENT ON FUNCTION notify_lead_assignment() IS 'Creates notification when an installer is assigned to a lead';
