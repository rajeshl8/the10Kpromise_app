-- Migration: Allow partners to insert protections on behalf of other partners
-- Issue: https://github.com/rajeshl8/the10Kpromise_app/issues/1
-- Description: Updates RLS policies to enable partners to log protections for other partners
--              and create junior partner records
-- Date: 2026-01-27

-- ========================================
-- 1. Update PROTECTIONS insert policy
-- ========================================

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

-- ========================================
-- 2. Update PARTNERS insert policy
-- ========================================

-- Drop existing insert policy for partners
DROP POLICY IF EXISTS partners_insert ON public.partners;

-- Create new policy that allows:
-- 1. Admins to insert anyone
-- 2. Partners to insert themselves (original behavior)
-- 3. Partners to create other partners (for junior partners)
CREATE POLICY partners_insert ON public.partners
FOR INSERT WITH CHECK (
  -- Allow admins to insert anyone
  public.is_admin()
  OR
  -- Allow partners to insert themselves
  auth.uid() = user_id
  OR
  -- Allow authenticated partners to create junior partners
  -- (user_id will be different from auth.uid() for juniors)
  EXISTS (
    SELECT 1 FROM public.partners WHERE user_id = auth.uid()
  )
);

-- This allows senior partners to create junior partner records
-- Junior partners will have placeholder user_ids and won't have login access

