-- Verify and enable real-time updates for protections table
-- Run this in Supabase SQL Editor

-- 1. Check if realtime is enabled on protections table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'protections';

-- 2. Enable realtime on protections table (if not already enabled)
-- You need to do this in Supabase Dashboard:
-- Go to Database → Replication → Enable for 'protections' table

-- 3. Verify the protection_metrics view exists and works
SELECT * FROM protection_metrics;

-- 4. Test: This should show the current count
SELECT 
  (SELECT count(*) FROM protections WHERE status='approved' AND deleted_at IS NULL) as direct_count,
  (SELECT protected_count FROM protection_metrics) as view_count;

