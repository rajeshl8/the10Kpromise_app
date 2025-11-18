-- Debug: Check if partner email lookup is working correctly
-- Run this in Supabase SQL Editor

-- 1. Check exact email in database
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_id,
  LENGTH(email) as email_length,
  email = 'agentzarvislr@gmail.com' as exact_match
FROM partners 
WHERE email ILIKE 'agentzarvis%';

-- 2. Check if there are any hidden characters
SELECT 
  email,
  encode(email::bytea, 'hex') as email_hex,
  first_name,
  last_name
FROM partners 
WHERE email ILIKE '%zarvis%';

-- 3. Try the function manually (as if partner is signing in)
-- This will show if the function works
SELECT link_partner_by_email('agentzarvislr@gmail.com');

