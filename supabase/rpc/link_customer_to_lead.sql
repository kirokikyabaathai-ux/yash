-- ============================================================================
-- RPC FUNCTION: link_customer_to_lead
-- Requirements: 3.2, 3.3, 3.4
-- ============================================================================
-- This function links a customer account to an existing lead by phone number
-- If a matching lead exists, it updates the customer_account_id
-- If no matching lead exists, it creates a new lead for the customer

CREATE OR REPLACE FUNCTION link_customer_to_lead(
  p_customer_id UUID,
  p_phone TEXT,
  p_customer_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_address TEXT DEFAULT 'Not provided'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_lead_id UUID;
  v_new_lead_id UUID;
  v_result JSONB;
  v_customer_role TEXT;
BEGIN
  -- Verify the user is a customer
  SELECT role INTO v_customer_role
  FROM users
  WHERE id = p_customer_id;

  IF v_customer_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_customer_role != 'customer' THEN
    RAISE EXCEPTION 'Only customer accounts can be linked to leads';
  END IF;

  -- Query leads by phone number to find a match
  SELECT id INTO v_existing_lead_id
  FROM leads
  WHERE phone = p_phone
    AND customer_account_id IS NULL  -- Only link to unlinked leads
  ORDER BY created_at DESC
  LIMIT 1;

  -- If a matching lead exists, link it to the customer
  IF v_existing_lead_id IS NOT NULL THEN
    UPDATE leads
    SET 
      customer_account_id = p_customer_id,
      updated_at = NOW()
    WHERE id = v_existing_lead_id;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'linked',
      'message', 'Customer linked to existing lead',
      'lead_id', v_existing_lead_id,
      'customer_id', p_customer_id
    );
  ELSE
    -- No matching lead found, create a new lead for the customer
    INSERT INTO leads (
      customer_name,
      phone,
      email,
      address,
      status,
      created_by,
      customer_account_id,
      source
    ) VALUES (
      p_customer_name,
      p_phone,
      p_email,
      p_address,
      'inquiry',
      p_customer_id,
      p_customer_id,
      'self'
    )
    RETURNING id INTO v_new_lead_id;

    -- Initialize timeline for the new lead
    INSERT INTO lead_steps (lead_id, step_id, status)
    SELECT v_new_lead_id, id, 'pending'
    FROM step_master
    ORDER BY order_index;

    v_result := jsonb_build_object(
      'success', true,
      'action', 'created',
      'message', 'New lead created for customer',
      'lead_id', v_new_lead_id,
      'customer_id', p_customer_id
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION link_customer_to_lead(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

