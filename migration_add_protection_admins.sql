-- Migration: Add admin access for protection viewing
-- Date: 2025-01-24
-- Purpose: Grant admin access to specific emails for viewing all protections

-- Add admins using the make_admin function
-- These users will have access to:
-- - /admin/partners (Partner Management)
-- - /admin/upload (CSV Upload)
-- - /admin/protections (View All Protections) ← NEW

SELECT make_admin('pavanfin@repalas.com');
SELECT make_admin('lingamrajesh06@gmail.com');

-- Verify admins were added
SELECT * FROM list_all_admins();

-- Expected output should include:
-- pavanfin@repalas.com
-- lingamrajesh06@gmail.com

-- Notes:
-- - Users must have logged in at least once for their accounts to exist
-- - If make_admin returns an error, it means the user hasn't signed in yet
-- - Have them sign in with Google first, then run this script again

