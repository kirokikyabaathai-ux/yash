-- Migration: Add trigger to sync auth.users to public.users
-- Date: 2025-11-27
-- Description: Automatically creates a public.users record when a new auth.users record is created
-- This ensures users created through any method (signup, admin, dashboard) get a profile

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  -- Note: We set a default role of 'customer' for users created outside the normal flow
  -- Admins can update the role later if needed
  INSERT INTO public.users (id, email, name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), -- Use name from metadata or email as fallback
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'), -- Default to customer role
    'active'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts if user already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
-- This trigger fires AFTER a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a public.users record when a new auth.users record is created';
