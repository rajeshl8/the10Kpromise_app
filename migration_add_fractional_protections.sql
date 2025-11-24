-- Migration: Add support for fractional protections (0.5 credit sharing)
-- Date: 2025-01-24
-- Purpose: Allow partners to share credit for a single family (0.5 + 0.5 = 1.0)

-- 1. Add protection_count column to protections table
-- Default is 1.0 (full credit), but can be 0.5 for shared credit
ALTER TABLE public.protections 
ADD COLUMN IF NOT EXISTS protection_count numeric(3,2) DEFAULT 1.0 NOT NULL
CHECK (protection_count > 0 AND protection_count <= 1.0);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_protections_count 
ON public.protections(protection_count) 
WHERE status = 'approved' AND deleted_at IS NULL;

-- 2. Update protection_metrics view to SUM instead of COUNT
DROP VIEW IF EXISTS public.protection_metrics CASCADE;
CREATE OR REPLACE VIEW public.protection_metrics AS
SELECT 
  COALESCE(SUM(protection_count), 0)::numeric as protected_count
FROM public.protections 
WHERE status = 'approved' AND deleted_at IS NULL;

-- 3. Update partner_stats view to SUM instead of COUNT
DROP VIEW IF EXISTS public.partner_stats CASCADE;
CREATE OR REPLACE VIEW public.partner_stats AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) as full_name,
  p.personal_target,
  COALESCE(SUM(pr.protection_count) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL), 0)::numeric as completed_count,
  p.created_at
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.email, p.display_name, p.first_name, p.last_name, p.personal_target, p.created_at;

-- 4. Update leaderboard view to SUM instead of COUNT
DROP VIEW IF EXISTS public.leaderboard CASCADE;
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, SPLIT_PART(p.email, '@', 1)) as name,
  p.personal_target,
  COALESCE(SUM(pr.protection_count) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL), 0)::numeric as completed_count,
  ROUND(
    (COALESCE(SUM(pr.protection_count) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL), 0)::numeric / 
    NULLIF(p.personal_target, 0)::numeric) * 100, 
    1
  ) as completion_percentage
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
HAVING COALESCE(SUM(pr.protection_count) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL), 0) > 0
ORDER BY completed_count DESC, completion_percentage DESC
LIMIT 50;

-- Grant permissions
GRANT SELECT ON public.partner_stats TO authenticated;
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.protection_metrics TO authenticated, anon;

-- 5. Verify the changes
SELECT 
  'Total Protections (Full + Fractional)' as metric,
  SUM(protection_count) as count
FROM public.protections
WHERE status = 'approved' AND deleted_at IS NULL

UNION ALL

SELECT 
  'Full Protections (1.0)' as metric,
  COUNT(*) as count
FROM public.protections
WHERE status = 'approved' AND deleted_at IS NULL AND protection_count = 1.0

UNION ALL

SELECT 
  'Fractional Protections (0.5)' as metric,
  COUNT(*) as count
FROM public.protections
WHERE status = 'approved' AND deleted_at IS NULL AND protection_count = 0.5;

-- 6. Test query - Check a specific partner's count
-- Replace 'partner-email@example.com' with actual email to test
/*
SELECT 
  p.email,
  p.display_name,
  COUNT(pr.id) as total_records,
  SUM(pr.protection_count) as total_credit
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id 
  AND pr.status = 'approved' 
  AND pr.deleted_at IS NULL
WHERE p.email = 'partner-email@example.com'
GROUP BY p.email, p.display_name;
*/

-- NOTES:
-- 1. All existing protections automatically get 1.0 (full credit)
-- 2. CSV upload now supports "Protection Count" column (1.0 or 0.5)
-- 3. If "Protection Count" is missing in CSV, defaults to 1.0
-- 4. Two partners can each enter 0.5 for the same family (shared credit)
-- 5. Dashboard, leaderboard, and global counter all use SUM now

