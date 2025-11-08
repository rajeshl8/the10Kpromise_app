# Dashboard Feature Setup Guide

## 🎯 Overview

This guide will help you add the personal dashboard feature to The10KPromise app. The dashboard includes:

1. **Personal Stats** - Shows each user's progress toward their personal goal
2. **Goal Setting** - Users can set and update their personal target
3. **Top 10 Leaderboard** - Displays the top performers

## 📊 Database Changes Required

### Step 1: Run the Migration in Supabase

Go to your Supabase project → SQL Editor and run the following SQL:

```sql
-- 1. Add personal_target column to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS personal_target integer DEFAULT 100;

-- 2. Create a view for partner statistics
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

-- 4. Grant permissions
GRANT SELECT ON public.partner_stats TO authenticated;
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.partner_stats TO anon;
GRANT SELECT ON public.leaderboard TO anon;
```

### Step 2: Verify the Migration

After running the SQL, verify in Supabase:
- Go to **Table Editor** → Check that `partners` table has the `personal_target` column
- Go to **Database** → **Views** → You should see `partner_stats` and `leaderboard` views

The views automatically inherit security from the underlying tables (partners and protections), so no additional RLS configuration is needed!

## ✅ What's Already Done

The following files have been created/updated in your codebase:

### New Files:
- ✅ `src/components/Dashboard.tsx` - Main dashboard component
- ✅ `migration_dashboard.sql` - SQL migration file (for reference)
- ✅ `DASHBOARD_SETUP.md` - This guide

### Updated Files:
- ✅ `schema.sql` - Added personal_target column and views
- ✅ `src/app/page.tsx` - Integrated dashboard component
- ✅ `src/components/AddProtectionDialog.tsx` - Already updated with better styling

## 🚀 Features

### 1. Personal Dashboard
- **Progress tracking**: Visual progress bar showing completion percentage
- **Dynamic stats**: Real-time updates when protections are added
- **Editable goal**: Users can update their personal target anytime

### 2. Leaderboard
- **Top 10 display**: Shows the most successful partners
- **Medal badges**: Gold, silver, bronze for top 3
- **Current user highlight**: Your position is highlighted in blue
- **Percentage tracking**: Shows completion rate for each person

### 3. Real-time Updates
- Dashboard automatically updates when:
  - New protections are added
  - Personal targets are changed
  - Other users make progress

## 🎨 UI Features

- **Gradient backgrounds**: Modern blue-purple gradients
- **Responsive design**: Works on mobile and desktop
- **Hover effects**: Interactive cards and buttons
- **Progress animations**: Smooth transitions on progress bars
- **Confetti celebration**: Still works on global progress

## 📝 Default Values

- **Default personal target**: 100 families
- **Leaderboard limit**: Top 50 performers (displaying top 10)
- **Minimum target**: 1 family

## 🔧 Testing the Feature

After running the SQL migration:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Sign in to the app**

3. **You should see**:
   - Your personal stats (0 completed by default)
   - Personal target of 100 (default)
   - Empty leaderboard initially
   - Button to update your goal

4. **Add a protection** using the "+ Protect Family" button

5. **Watch the dashboard update** automatically:
   - Completed count increases
   - Progress bar advances
   - You appear on the leaderboard

## 🐛 Troubleshooting

### Dashboard shows "Loading dashboard..."
- Check that the `partner_stats` view exists in Supabase
- Verify RLS policies allow reading from the view

### Leaderboard is empty
- This is normal if no one has completed any protections yet
- Add some protections to see the leaderboard populate

### "Update Goal" doesn't work
- Check that the `personal_target` column exists in the `partners` table
- Verify the partners RLS policy allows updates

### Views show errors
- Make sure you ran the entire SQL migration
- Check for syntax errors in Supabase SQL Editor
- Verify all tables exist (partners, protections)

## 💡 Customization Options

You can easily customize:

- **Default target**: Change `DEFAULT 100` in the migration
- **Leaderboard size**: Change `LIMIT 50` in the leaderboard view
- **Colors**: Update Tailwind classes in Dashboard.tsx
- **Celebration threshold**: Add confetti when personal goals are reached

## 📊 Database Schema Summary

### New Column:
```
partners.personal_target (integer, default: 100)
```

### New Views:
```
partner_stats - Individual partner statistics
leaderboard - Top performers ranking
```

### Existing Tables (unchanged):
```
partners - User information
protections - Protection records
```

## 🎉 You're Done!

Once you've run the SQL migration in Supabase, your dashboard is ready to use!

Users can now:
- ✅ Track their personal progress
- ✅ Set and update goals
- ✅ Compete on the leaderboard
- ✅ See real-time updates
- ✅ Celebrate achievements

Happy coding! 🚀

