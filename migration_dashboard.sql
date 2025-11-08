-- Migration: Add Dashboard Features
-- Run this in your Supabase SQL Editor

-- 1. Add personal_target column to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS personal_target integer DEFAULT 100;

-- 2. Create a view for partner statistics
-- Note: Views inherit security from underlying tables, no separate RLS needed
CREATE OR REPLACE VIEW public.partner_stats AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) as full_name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) as completed_count,
  p.created_at
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.email, p.display_name, p.first_name, p.last_name, p.personal_target, p.created_at;

-- 3. Create a leaderboard view (top performers)
-- Note: Views inherit security from underlying tables, no separate RLS needed
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, SPLIT_PART(p.email, '@', 1)) as name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) as completed_count,
  ROUND(
    (COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL)::numeric / 
    NULLIF(p.personal_target, 0)::numeric) * 100, 
    1
  ) as completion_percentage
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
HAVING COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) > 0
ORDER BY completed_count DESC, completion_percentage DESC
LIMIT 50;

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.partner_stats TO authenticated;
GRANT SELECT ON public.leaderboard TO authenticated;

-- Also grant to anon for public access if needed
GRANT SELECT ON public.partner_stats TO anon;
GRANT SELECT ON public.leaderboard TO anon;

