# 🚀 Quick Start: Dashboard Feature

## What You Need to Do in Supabase

### 1️⃣ Go to Supabase SQL Editor
Log into your Supabase project → SQL Editor

### 2️⃣ Copy and Paste This SQL
Run this entire SQL block:

```sql
-- 1. Add personal_target column
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS personal_target integer DEFAULT 100;

-- 2. Create partner stats view
CREATE OR REPLACE VIEW public.partner_stats AS
SELECT 
  p.id, p.user_id, p.email, p.display_name,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) as full_name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) as completed_count,
  p.created_at
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.email, p.display_name, p.first_name, p.last_name, p.personal_target, p.created_at;

-- 3. Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id, p.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, p.display_name, SPLIT_PART(p.email, '@', 1)) as name,
  p.personal_target,
  COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) as completed_count,
  ROUND((COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL)::numeric / NULLIF(p.personal_target, 0)::numeric) * 100, 1) as completion_percentage
FROM public.partners p
LEFT JOIN public.protections pr ON pr.partner_user_id = p.user_id
GROUP BY p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
HAVING COUNT(pr.id) FILTER (WHERE pr.status = 'approved' AND pr.deleted_at IS NULL) > 0
ORDER BY completed_count DESC
LIMIT 50;

-- 4. Grant permissions
GRANT SELECT ON public.partner_stats TO authenticated;
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.partner_stats TO anon;
GRANT SELECT ON public.leaderboard TO anon;
```

### 3️⃣ Restart Your App
```bash
npm run dev
```

### 4️⃣ Test It!
- Sign in
- You'll see your personal dashboard
- Try adding a protection
- Watch your stats update in real-time!

## ✨ What You Get

✅ **Personal Stats Dashboard**
- Your progress toward your goal
- Visual progress bar
- Ability to set/update your target

✅ **Top 10 Leaderboard**
- See who's leading
- Medal badges for top 3
- Your position highlighted

✅ **Real-time Updates**
- Auto-refreshes when protections added
- Live leaderboard updates

## 📁 Files Modified

All code changes are already done! Just need to run the SQL:

- ✅ `src/components/Dashboard.tsx` (NEW)
- ✅ `src/app/page.tsx` (UPDATED)
- ✅ `schema.sql` (UPDATED)
- ✅ `migration_dashboard.sql` (REFERENCE FILE)

That's it! 🎉

