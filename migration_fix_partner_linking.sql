-- Fix partner linking on first login
-- This function allows partners to link their auth account to pre-created partner records
-- Run this in Supabase SQL Editor

-- Create a secure function to link partner accounts
CREATE OR REPLACE FUNCTION public.link_partner_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
BEGIN
  -- Find partner by email and update their user_id to current auth user
  UPDATE public.partners
  SET user_id = auth.uid(),
      display_name = COALESCE(display_name, (
        SELECT raw_user_meta_data->>'full_name' 
        FROM auth.users 
        WHERE id = auth.uid()
      ))
  WHERE email = p_email
    AND user_id != auth.uid() -- Only update if not already linked
  RETURNING id INTO v_partner_id;
  
  RETURN v_partner_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.link_partner_by_email(text) TO authenticated;

-- Verify the function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'link_partner_by_email';

