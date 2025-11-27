-- Migration: Auto-create lead when customer signs up
-- Date: 2025-11-27
-- Description: Automatically creates a lead with source='self' when a customer user is created

-- Update the handle_new_user function to also create a lead for customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
  v_name text;
  v_phone text;
  v_email text;
BEGIN
  -- Extract metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  v_phone := NEW.phone;
  v_email := NEW.email;
  
  -- Insert into public.users table
  INSERT INTO public.users (id, email, name, phone, role, status)
  VALUES (
    NEW.id,
    v_email,
    v_name,
    v_phone,
    v_role,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- If the user is a customer, automatically create a lead with source='self'
  IF v_role = 'customer' THEN
    INSERT INTO public.leads (
      customer_name,
      phone,
      email,
      address,
      notes,
      source,
      created_by,
      customer_account_id,
      status
    )
    VALUES (
      v_name,
      v_phone,
      v_email,
      '', -- Empty address, customer will fill it later
      'Auto-created lead from customer signup',
      'self', -- Source is 'self' for customer signups
      NEW.id, -- The customer is the creator
      NEW.id, -- Link to the customer account
      'lead' -- Initial status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a public.users record and a lead (for customers) when a new auth.users record is created';
