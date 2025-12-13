-- Migration: Update Views to Use partner_id Instead of partner_user_id
-- This makes the system more robust by eliminating sync dependencies
-- Date: December 2025
-- Run after: migration_fix_partner_user_id_sync.sql

-- ============================================================================
-- Update Database Views to Join via partner_id
-- ============================================================================

-- Drop existing views first
DROP VIEW IF EXISTS public.leaderboard CASCADE;
DROP VIEW IF EXISTS public.partner_stats CASCADE;

-- Recreate partner_stats view with partner_id join
CREATE VIEW public.partner_stats AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) AS full_name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) AS completed_count,
  p.created_at
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_id = p.id  -- Changed from partner_user_id
GROUP BY p.id, p.user_id, p.email, p.display_name, p.first_name, p.last_name, p.personal_target, p.created_at;

-- Recreate leaderboard view with partner_id join
CREATE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, SPLIT_PART(p.email, '@', 1)) AS name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) AS completed_count,
  ROUND(
    (COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL)::numeric / 
    NULLIF(p.personal_target, 0)::numeric) * 100, 
    1
  ) AS completion_percentage
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_id = p.id  -- Changed from partner_user_id
GROUP BY p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
HAVING COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) > 0
ORDER BY completed_count DESC, completion_percentage DESC
LIMIT 50;

-- Verify views were created successfully
SELECT 
  'partner_stats' as view_name,
  COUNT(*) as record_count
FROM public.partner_stats
UNION ALL
SELECT 
  'leaderboard' as view_name,
  COUNT(*) as record_count
FROM public.leaderboard;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Views updated successfully!';
  RAISE NOTICE 'Now using partner_id for joins.';
  RAISE NOTICE 'No more sync issues!';
  RAISE NOTICE '============================================';
END $$;

