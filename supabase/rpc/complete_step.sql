-- ============================================================================
-- RPC FUNCTION: complete_step
-- Requirements: 7.1, 7.2, 7.5
-- ============================================================================
-- This function completes a timeline step for a lead
-- It validates user permissions, updates the step with completion data,
-- and progresses the timeline to the next step

CREATE OR REPLACE FUNCTION complete_step(
  p_lead_id UUID,
  p_step_id UUID,
  p_user_id UUID,
  p_remarks TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role TEXT;
  v_allowed_roles TEXT[];
  v_remarks_required BOOLEAN;
  v_attachments_allowed BOOLEAN;
  v_current_status TEXT;
  v_step_order INTEGER;
  v_next_step_id UUID;
  v_result JSONB;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get step configuration
  SELECT allowed_roles, remarks_required, attachments_allowed, order_index
  INTO v_allowed_roles, v_remarks_required, v_attachments_allowed, v_step_order
  FROM step_master
  WHERE id = p_step_id;

  IF v_allowed_roles IS NULL THEN
    RAISE EXCEPTION 'Step not found';
  END IF;

  -- Validate user permissions (admin can bypass)
  IF v_user_role != 'admin' AND NOT (v_user_role = ANY(v_allowed_roles)) THEN
    RAISE EXCEPTION 'User role % is not authorized to complete this step', v_user_role;
  END IF;

  -- Get current step status
  SELECT status INTO v_current_status
  FROM lead_steps
  WHERE lead_id = p_lead_id AND step_id = p_step_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Lead step not found';
  END IF;

  IF v_current_status = 'completed' THEN
    RAISE EXCEPTION 'Step is already completed';
  END IF;

  -- Validate remarks requirement
  IF v_remarks_required AND (p_remarks IS NULL OR p_remarks = '') THEN
    RAISE EXCEPTION 'Remarks are required for this step';
  END IF;

  -- Validate attachments requirement
  IF v_attachments_allowed AND p_attachments IS NOT NULL THEN
    -- Attachments are allowed, store them
    NULL;
  ELSIF NOT v_attachments_allowed AND p_attachments IS NOT NULL AND array_length(p_attachments, 1) > 0 THEN
    RAISE EXCEPTION 'Attachments are not allowed for this step';
  END IF;

  -- Update the lead_step with completion data
  UPDATE lead_steps
  SET 
    status = 'completed',
    completed_by = p_user_id,
    completed_at = NOW(),
    remarks = p_remarks,
    attachments = COALESCE(p_attachments, attachments),
    updated_at = NOW()
  WHERE lead_id = p_lead_id AND step_id = p_step_id;

  -- Progress timeline to next step
  -- Find the next step by order_index
  SELECT sm.id INTO v_next_step_id
  FROM step_master sm
  WHERE sm.order_index > v_step_order
  ORDER BY sm.order_index ASC
  LIMIT 1;

  -- If there is a next step, update its status from 'upcoming' to 'pending'
  IF v_next_step_id IS NOT NULL THEN
    UPDATE lead_steps
    SET 
      status = 'pending',
      updated_at = NOW()
    WHERE lead_id = p_lead_id 
      AND step_id = v_next_step_id 
      AND status = 'upcoming';
  END IF;

  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Step completed successfully',
    'lead_id', p_lead_id,
    'step_id', p_step_id,
    'completed_at', NOW(),
    'next_step_id', v_next_step_id
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_step(UUID, UUID, UUID, TEXT, TEXT[]) TO authenticated;

