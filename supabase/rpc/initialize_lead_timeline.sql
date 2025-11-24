-- ============================================================================
-- RPC FUNCTION: initialize_lead_timeline
-- Requirements: 6.4
-- ============================================================================
-- This function creates lead_steps records for all step_master steps
-- Sets initial status to "pending" for all steps

CREATE OR REPLACE FUNCTION initialize_lead_timeline(
  p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_steps_created INTEGER;
  v_result JSONB;
  v_lead_exists BOOLEAN;
BEGIN
  -- Check if lead exists
  SELECT EXISTS(
    SELECT 1 
    FROM leads 
    WHERE id = p_lead_id
  ) INTO v_lead_exists;

  IF NOT v_lead_exists THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Check if timeline already exists
  IF EXISTS(SELECT 1 FROM lead_steps WHERE lead_id = p_lead_id) THEN
    RAISE EXCEPTION 'Timeline already initialized for this lead';
  END IF;

  -- Create lead_steps records for all steps in step_master
  INSERT INTO lead_steps (lead_id, step_id, status)
  SELECT 
    p_lead_id,
    id,
    'pending'
  FROM step_master
  ORDER BY order_index;

  -- Get count of steps created
  GET DIAGNOSTICS v_steps_created = ROW_COUNT;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Timeline initialized successfully',
    'lead_id', p_lead_id,
    'steps_created', v_steps_created
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION initialize_lead_timeline(UUID) TO authenticated;

