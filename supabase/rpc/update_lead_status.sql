-- ============================================================================
-- RPC FUNCTION: update_lead_status
-- Requirements: 2.3, 5.3
-- ============================================================================
-- This function checks if mandatory documents are uploaded and PM form is submitted
-- If both conditions are met, it automatically updates the lead status to "interested"

CREATE OR REPLACE FUNCTION update_lead_status(
  p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_docs_check JSONB;
  v_all_docs_uploaded BOOLEAN;
  v_pm_form_submitted BOOLEAN;
  v_should_update BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get current lead status
  SELECT status INTO v_current_status
  FROM leads
  WHERE id = p_lead_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Only update if current status is 'ongoing'
  IF v_current_status != 'ongoing' THEN
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Lead status is not ongoing, no update needed',
      'lead_id', p_lead_id,
      'current_status', v_current_status,
      'updated', false
    );
    RETURN v_result;
  END IF;

  -- Check if all mandatory documents are uploaded
  v_docs_check := check_mandatory_documents(p_lead_id);
  v_all_docs_uploaded := (v_docs_check->>'all_uploaded')::BOOLEAN;

  -- Check if PM Suryaghar form is submitted
  SELECT EXISTS(
    SELECT 1 
    FROM pm_suryaghar_form 
    WHERE lead_id = p_lead_id
  ) INTO v_pm_form_submitted;

  -- Determine if status should be updated
  v_should_update := v_all_docs_uploaded AND v_pm_form_submitted;

  IF v_should_update THEN
    -- Update lead status to 'interested'
    UPDATE leads
    SET 
      status = 'interested',
      updated_at = NOW()
    WHERE id = p_lead_id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Lead status updated to interested',
      'lead_id', p_lead_id,
      'previous_status', v_current_status,
      'new_status', 'interested',
      'updated', true,
      'all_docs_uploaded', v_all_docs_uploaded,
      'pm_form_submitted', v_pm_form_submitted
    );
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Conditions not met for status update',
      'lead_id', p_lead_id,
      'current_status', v_current_status,
      'updated', false,
      'all_docs_uploaded', v_all_docs_uploaded,
      'pm_form_submitted', v_pm_form_submitted,
      'missing_documents', v_docs_check->'missing_documents'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_lead_status(UUID) TO authenticated;

