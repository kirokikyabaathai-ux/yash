-- Notification Triggers
-- Creates notifications automatically for various events
-- Requirements: 19.1, 19.2, 19.3

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
