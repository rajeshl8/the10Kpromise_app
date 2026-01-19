-- Migration: Allow partners to insert protections on behalf of other partners
-- Issue: https://github.com/rajeshl8/the10Kpromise_app/issues/1
-- Description: Updates RLS policy to enable partners to log protections for other partners
-- Date: 2026-01-19

-- Drop existing insert policy for protections
DROP POLICY IF EXISTS prot_insert ON public.protections;

-- Create new policy that allows:
-- 1. Admins to insert for anyone
-- 2. Partners to insert for themselves (original behavior)
-- 3. Partners to insert for other partners (new "on behalf of" feature)
CREATE POLICY prot_insert ON public.protections
FOR INSERT WITH CHECK (
  -- Allow admins to insert for anyone
  public.is_admin() 
  OR 
  -- Allow partners to insert for themselves
  partner_user_id = auth.uid()
  OR 
  -- Allow authenticated partners to insert for other partners
  -- This enables the "on behalf of" feature
  EXISTS (
    SELECT 1 FROM public.partners WHERE user_id = auth.uid()
  )
);

-- Note: The SELECT policy remains unchanged, so partners can only view their own protections
-- This ensures privacy while allowing collaboration through the "on behalf of" feature

