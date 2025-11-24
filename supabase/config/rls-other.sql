-- Row-Level Security (RLS) Policies for lead_steps, pm_suryaghar_form, activity_log, and notifications tables
-- Requirements: 8.1, 8.2, 8.3, 8.4, 8.5

-- ============================================================================
-- RLS Policies for lead_steps table
-- ============================================================================

ALTER TABLE lead_steps ENABLE ROW LEVEL SECURITY;

-- Admin full access to lead_steps
CREATE POLICY "Admin full access" ON lead_steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Office Team full access to lead_steps
CREATE POLICY "Office full access" ON lead_steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'office'
    )
  );

-- Agent can access lead_steps for their own leads
CREATE POLICY "Agent own lead steps" ON lead_steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_steps.lead_id
      AND leads.created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- Customer can view lead_steps for their linked lead
CREATE POLICY "Customer own lead steps" ON lead_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_steps.lead_id
      AND leads.customer_account_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

-- Installer can view and update lead_steps for assigned leads
CREATE POLICY "Installer assigned lead steps view" ON lead_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_steps.lead_id
      AND leads.installer_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'installer'
    )
  );

CREATE POLICY "Installer assigned lead steps update" ON lead_steps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_steps.lead_id
      AND leads.installer_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'installer'
    )
  );

-- ============================================================================
-- RLS Policies for pm_suryaghar_form table
-- ============================================================================

ALTER TABLE pm_suryaghar_form ENABLE ROW LEVEL SECURITY;

-- Admin full access to pm_suryaghar_form
CREATE POLICY "Admin full access" ON pm_suryaghar_form
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Office Team full access to pm_suryaghar_form
CREATE POLICY "Office full access" ON pm_suryaghar_form
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'office'
    )
  );

-- Agent can access pm_suryaghar_form for their own leads
CREATE POLICY "Agent own lead form" ON pm_suryaghar_form
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = pm_suryaghar_form.lead_id
      AND leads.created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- Customer can view and submit pm_suryaghar_form for their linked lead
CREATE POLICY "Customer own lead form view" ON pm_suryaghar_form
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = pm_suryaghar_form.lead_id
      AND leads.customer_account_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

CREATE POLICY "Customer own lead form submit" ON pm_suryaghar_form
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = pm_suryaghar_form.lead_id
      AND leads.customer_account_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'customer'
    )
  );

-- Installer CANNOT access pm_suryaghar_form (no policy = no access)
-- This enforces Requirement 10.5: Installers cannot access PM Suryaghar form data

-- ============================================================================
-- RLS Policies for activity_log table
-- ============================================================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all activity logs
CREATE POLICY "Admin full access" ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Office Team can view all activity logs
CREATE POLICY "Office full access" ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'office'
    )
  );

-- All authenticated users can insert activity logs (for logging their own actions)
CREATE POLICY "Users can insert own activity" ON activity_log
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- Agent can view activity logs for their own leads
CREATE POLICY "Agent own lead activity" ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = activity_log.lead_id
      AND leads.created_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- ============================================================================
-- RLS Policies for notifications table
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin can view all notifications
CREATE POLICY "Admin full access" ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own notifications
CREATE POLICY "Users own notifications view" ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users own notifications update" ON notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );

-- System can insert notifications for any user (via service role)
-- This policy allows the application to create notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    true
  );
