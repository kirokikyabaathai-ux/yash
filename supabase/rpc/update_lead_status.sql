-- ============================================================================
-- RPC FUNCTION: update_lead_status
-- Requirements: 2.3, 5.3
-- ============================================================================
-- This function checks if customer profile is filled and documents are uploaded
-- Updates lead status based on conditions:
-- - lead → lead_interested: When customer shows interest (manual)
-- - lead_interested → lead_processing: When customer profile form is filled and docs uploaded

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
  v_profile_submitted BOOLEAN;
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

  -- Only update if current status is 'lead' or 'lead_interested'
  IF v_current_status NOT IN ('lead', 'lead_interested') THEN
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Lead status is already beyond initial stage, no update needed',
      'lead_id', p_lead_id,
      'current_status', v_current_status,
      'updated', false
    );
    RETURN v_result;
  END IF;

  -- Check if all mandatory documents are uploaded
  v_docs_check := check_mandatory_documents(p_lead_id);
  v_all_docs_uploaded := (v_docs_check->>'all_uploaded')::BOOLEAN;

  -- Check if customer profile is submitted
  SELECT EXISTS(
    SELECT 1 
    FROM customer_profiles 
    WHERE lead_id = p_lead_id
  ) INTO v_profile_submitted;

  -- Determine status update based on conditions
  IF v_profile_submitted AND v_current_status = 'lead_interested' THEN
    -- Customer profile submitted from interested status: update to 'lead_processing'
    UPDATE leads
    SET 
      status = 'lead_processing',
      updated_at = NOW()
    WHERE id = p_lead_id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Lead status updated to lead_processing',
      'lead_id', p_lead_id,
      'previous_status', v_current_status,
      'new_status', 'lead_processing',
      'updated', true,
      'profile_submitted', v_profile_submitted,
      'all_docs_uploaded', v_all_docs_uploaded
    );
  ELSIF v_profile_submitted AND v_all_docs_uploaded THEN
    -- Both conditions met: update to 'lead_processing'
    UPDATE leads
    SET 
      status = 'lead_processing',
      updated_at = NOW()
    WHERE id = p_lead_id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Lead status updated to lead_processing',
      'lead_id', p_lead_id,
      'previous_status', v_current_status,
      'new_status', 'lead_processing',
      'updated', true,
      'profile_submitted', v_profile_submitted,
      'all_docs_uploaded', v_all_docs_uploaded
    );
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Conditions not met for status update',
      'lead_id', p_lead_id,
      'current_status', v_current_status,
      'updated', false,
      'profile_submitted', v_profile_submitted,
      'all_docs_uploaded', v_all_docs_uploaded,
      'missing_documents', v_docs_check->'missing_documents'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_lead_status(UUID) TO authenticated;

