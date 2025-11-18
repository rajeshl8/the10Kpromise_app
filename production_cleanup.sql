-- ============================================
-- PRODUCTION CLEANUP SCRIPT
-- Clean all test data and reset for launch
-- ============================================
-- IMPORTANT: Review carefully before running!
-- Run this in Supabase SQL Editor
-- ============================================

-- ========================================
-- STEP 1: BACKUP (OPTIONAL BUT RECOMMENDED)
-- ========================================
-- Create backup tables (just in case you need to restore)
/*
CREATE TABLE protections_backup AS SELECT * FROM protections;
CREATE TABLE partners_backup AS SELECT * FROM partners;
-- To restore if needed: 
-- INSERT INTO protections SELECT * FROM protections_backup;
*/

-- ========================================
-- STEP 2: VIEW CURRENT DATA (BEFORE CLEANUP)
-- ========================================

-- Check current counts
SELECT 'Current Protections' as item, COUNT(*)::text as count FROM protections
UNION ALL
SELECT 'Current Partners', COUNT(*)::text FROM partners
UNION ALL
SELECT 'Current Admins', COUNT(*)::text FROM admins;

-- See all partners (decide which to keep)
SELECT id, email, first_name, last_name, hgi_partner_id, created_at 
FROM partners 
ORDER BY created_at DESC;

-- ========================================
-- STEP 3: DELETE ALL PROTECTIONS
-- ========================================

-- Delete ALL protection records (fresh start)
DELETE FROM protections;

-- Verify: Should return 0
SELECT COUNT(*) as remaining_protections FROM protections;

-- ========================================
-- STEP 4: RESET PROTECTION ID SEQUENCE
-- ========================================

-- Reset the PTK-YYMM-00001 counter to start from 1
ALTER SEQUENCE protection_seq RESTART WITH 1;

-- Verify: Next ID will be PTK-2511-00001 (or current YYMM)
SELECT gen_protection_id() as next_protection_id;

-- ========================================
-- STEP 5: CLEAN STAGING TABLE
-- ========================================

-- Clear any uploaded but not processed data
DELETE FROM staging_protections;

-- ========================================
-- STEP 6: OPTIONAL - KEEP SPECIFIC PARTNERS
-- ========================================

-- Option A: Keep ALL partners (recommended if you want them to keep access)
-- (Do nothing, skip to Step 7)

-- Option B: Delete ONLY test partners with specific emails
-- Uncomment and modify the emails you want to remove:
/*
DELETE FROM partners 
WHERE email IN (
  'test@example.com',
  'demo@test.com'
  -- Add test emails here
);
*/

-- Option C: Keep ONLY specific partners, delete all others
-- Uncomment and modify to keep only these emails:
/*
DELETE FROM partners 
WHERE email NOT IN (
  'agentzarvislr@gmail.com',
  'your-real-partner@email.com'
  -- Add real partner emails you want to KEEP
);
*/

-- ========================================
-- STEP 7: VERIFY FINAL STATE (AFTER CLEANUP)
-- ========================================

-- Check final counts
SELECT 'Protections Remaining' as item, COUNT(*)::text as count FROM protections
UNION ALL
SELECT 'Partners Remaining', COUNT(*)::text FROM partners
UNION ALL
SELECT 'Admins (should not change)', COUNT(*)::text FROM admins
UNION ALL
SELECT 'Staging Cleared', COUNT(*)::text FROM staging_protections;

-- See remaining partners
SELECT 
  email,
  first_name,
  last_name,
  hgi_partner_id,
  created_at
FROM partners 
ORDER BY created_at DESC;

-- Check the big counter (should be 10,000 or your goal)
SELECT * FROM protection_metrics;

-- ========================================
-- STEP 8: VERIFY HOMEPAGE COUNTER
-- ========================================

-- This should show your starting goal
-- If GOAL is 10,000 and you have 0 protections:
-- Homepage should show "10,000 remaining"
SELECT 
  10000 as goal,  -- Change if your goal is different
  COALESCE((SELECT protected_count FROM protection_metrics), 0) as protected,
  10000 - COALESCE((SELECT protected_count FROM protection_metrics), 0) as remaining;

-- ========================================
-- SUMMARY
-- ========================================
/*
After running this script:
✅ All protections deleted
✅ Protection ID sequence reset to 1
✅ Staging table cleared
✅ Admins preserved
✅ Partners preserved (or selectively removed)
✅ Homepage shows 10,000 remaining (or your goal)
✅ Next protection will be PTK-2511-00001

Your app is ready for production! 🚀
*/

