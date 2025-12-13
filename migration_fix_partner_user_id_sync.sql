-- Migration: Fix Partner User ID Synchronization Issue
-- Problem: When partners are created via CSV upload, they get a temp user_id.
--          When they login with Google, partner record gets updated but protections don't.
-- Solution: 1) Fix existing data 2) Update link function to sync protections automatically
-- Date: December 2025

-- ============================================================================
-- PART 1: Fix Existing Data (One-Time)
-- ============================================================================

-- Show current mismatches (for verification)
SELECT 
  p.email,
  p.display_name,
  p.hgi_partner_id,
  COUNT(pr.id) as total_protections,
  COUNT(CASE WHEN pr.partner_user_id != p.user_id THEN 1 END) as mismatched_protections
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_id = p.id
GROUP BY p.id, p.email, p.display_name, p.hgi_partner_id
HAVING COUNT(CASE WHEN pr.partner_user_id != p.user_id THEN 1 END) > 0;

-- Fix all protections to match their partner's current user_id
UPDATE public.protections pr
SET partner_user_id = p.user_id
FROM public.partners p
WHERE pr.partner_id = p.id
  AND pr.partner_user_id != p.user_id;

-- Verify the fix
SELECT 
  'Fixed protections' as status,
  COUNT(*) as count
FROM public.protections pr
JOIN public.partners p ON pr.partner_id = p.id
WHERE pr.partner_user_id = p.user_id;

-- ============================================================================
-- PART 2: Update Link Function (Future-Proof)
-- ============================================================================

-- Drop old function
DROP FUNCTION IF EXISTS public.link_partner_by_email(text);

-- Create improved function that also updates protections
CREATE OR REPLACE FUNCTION public.link_partner_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_old_user_id uuid;
  v_updated_protections integer;
BEGIN
  -- Get the current partner record
  SELECT id, user_id INTO v_partner_id, v_old_user_id
  FROM public.partners
  WHERE email = p_email;
  
  -- If partner doesn't exist, return null
  IF v_partner_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If already linked to this user, just return the partner_id
  IF v_old_user_id = auth.uid() THEN
    RETURN v_partner_id;
  END IF;
  
  -- Update partner record with real auth user_id
  UPDATE public.partners
  SET user_id = auth.uid(),
      display_name = COALESCE(display_name, (
        SELECT raw_user_meta_data->>'full_name' 
        FROM auth.users 
        WHERE id = auth.uid()
      ))
  WHERE id = v_partner_id;
  
  -- Update ALL protections for this partner to use the real user_id
  UPDATE public.protections
  SET partner_user_id = auth.uid()
  WHERE partner_id = v_partner_id
    AND partner_user_id = v_old_user_id;
  
  GET DIAGNOSTICS v_updated_protections = ROW_COUNT;
  
  -- Log the update (optional, for debugging)
  RAISE NOTICE 'Linked partner % (%) to user %, updated % protections', 
    v_partner_id, p_email, auth.uid(), v_updated_protections;
  
  RETURN v_partner_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.link_partner_by_email(text) TO authenticated;

-- ============================================================================
-- PART 3: Verification Queries
-- ============================================================================

-- Check if any mismatches remain
SELECT 
  'Remaining Mismatches' as check_name,
  COUNT(*) as count
FROM public.protections pr
JOIN public.partners p ON pr.partner_id = p.id
WHERE pr.partner_user_id != p.user_id;

-- Show partner statistics
SELECT 
  p.email,
  p.display_name,
  p.hgi_partner_id,
  COUNT(pr.id) as total_protections,
  COUNT(CASE WHEN pr.status = 'approved' AND pr.deleted_at IS NULL THEN 1 END) as approved_protections
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_id = p.id
GROUP BY p.id, p.email, p.display_name, p.hgi_partner_id
ORDER BY total_protections DESC;

-- ============================================================================
-- Migration Complete!
-- ============================================================================

-- Summary message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'All partner_user_id values synced.';
  RAISE NOTICE 'Function updated to auto-sync on login.';
  RAISE NOTICE '============================================';
END $$;

