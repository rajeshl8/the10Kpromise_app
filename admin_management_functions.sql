-- ============================================
-- Admin Management Functions
-- Easy-to-use SQL functions for admin management
-- ============================================

-- 1. MAKE ADMIN BY EMAIL
-- Usage: SELECT make_admin('user@example.com', 'Optional note');
CREATE OR REPLACE FUNCTION make_admin(user_email text, admin_note text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  user_name text;
BEGIN
  -- Find user by email
  SELECT id, raw_user_meta_data->>'full_name' 
  INTO target_user_id, user_name
  FROM auth.users 
  WHERE email = user_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN '❌ ERROR: User with email "' || user_email || '" not found. Make sure they have logged in at least once.';
  END IF;
  
  -- Check if already admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = target_user_id) THEN
    RETURN '⚠️  User "' || user_email || '" is already an admin.';
  END IF;
  
  -- Add to admins table
  INSERT INTO public.admins (user_id, note)
  VALUES (target_user_id, COALESCE(admin_note, user_name || ' - Admin'));
  
  RETURN '✅ SUCCESS: "' || user_email || '" (' || COALESCE(user_name, 'No name') || ') is now an admin!';
END;
$$;

-- 2. REMOVE ADMIN BY EMAIL
-- Usage: SELECT remove_admin('user@example.com');
CREATE OR REPLACE FUNCTION remove_admin(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  rows_deleted int;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN '❌ ERROR: User with email "' || user_email || '" not found.';
  END IF;
  
  -- Remove from admins table
  DELETE FROM public.admins WHERE user_id = target_user_id;
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  IF rows_deleted = 0 THEN
    RETURN '⚠️  User "' || user_email || '" was not an admin.';
  END IF;
  
  RETURN '✅ SUCCESS: Admin access removed for "' || user_email || '"';
END;
$$;

-- 3. CHECK IF EMAIL IS ADMIN
-- Usage: SELECT is_email_admin('user@example.com');
CREATE OR REPLACE FUNCTION is_email_admin(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  is_admin boolean;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN '❌ User not found';
  END IF;
  
  -- Check if admin
  is_admin := EXISTS (SELECT 1 FROM public.admins WHERE user_id = target_user_id);
  
  IF is_admin THEN
    RETURN '✅ YES - Is Admin';
  ELSE
    RETURN '❌ NO - Not Admin';
  END IF;
END;
$$;

-- 4. LIST ALL ADMINS
-- Usage: SELECT * FROM list_all_admins();
CREATE OR REPLACE FUNCTION list_all_admins()
RETURNS TABLE (
  email text,
  name text,
  note text,
  added_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email,
    u.raw_user_meta_data->>'full_name' as name,
    a.note,
    a.created_at as added_date
  FROM public.admins a
  JOIN auth.users u ON u.id = a.user_id
  ORDER BY a.created_at DESC;
END;
$$;

-- 5. BULK MAKE ADMINS (Multiple emails at once)
-- Usage: SELECT bulk_make_admins(ARRAY['user1@example.com', 'user2@example.com'], 'Batch import');
CREATE OR REPLACE FUNCTION bulk_make_admins(user_emails text[], admin_note text DEFAULT 'Bulk admin')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_address text;
  success_count int := 0;
  skip_count int := 0;
  error_count int := 0;
  result_msg text := '';
BEGIN
  FOREACH email_address IN ARRAY user_emails
  LOOP
    BEGIN
      DECLARE
        target_user_id uuid;
      BEGIN
        -- Find user
        SELECT id INTO target_user_id
        FROM auth.users 
        WHERE email = email_address;
        
        IF target_user_id IS NULL THEN
          error_count := error_count + 1;
          result_msg := result_msg || '❌ ' || email_address || ' (not found)\n';
        ELSIF EXISTS (SELECT 1 FROM public.admins WHERE user_id = target_user_id) THEN
          skip_count := skip_count + 1;
          result_msg := result_msg || '⚠️  ' || email_address || ' (already admin)\n';
        ELSE
          INSERT INTO public.admins (user_id, note)
          VALUES (target_user_id, admin_note);
          success_count := success_count + 1;
          result_msg := result_msg || '✅ ' || email_address || '\n';
        END IF;
      END;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      result_msg := result_msg || '❌ ' || email_address || ' (error)\n';
    END;
  END LOOP;
  
  RETURN E'📊 BULK ADMIN RESULTS:\n' ||
         '✅ Added: ' || success_count || '\n' ||
         '⚠️  Skipped (already admin): ' || skip_count || '\n' ||
         '❌ Errors: ' || error_count || '\n\n' ||
         'Details:\n' || result_msg;
END;
$$;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Make someone admin:
-- SELECT make_admin('john@example.com');
-- SELECT make_admin('jane@example.com', 'Regional Manager');

-- Remove admin access:
-- SELECT remove_admin('john@example.com');

-- Check if someone is admin:
-- SELECT is_email_admin('john@example.com');

-- List all admins:
-- SELECT * FROM list_all_admins();

-- Bulk add admins:
-- SELECT bulk_make_admins(ARRAY['user1@example.com', 'user2@example.com', 'user3@example.com']);

-- ============================================
-- QUICK REFERENCE COMMANDS
-- ============================================

/*
╔════════════════════════════════════════════════════════════╗
║                  QUICK ADMIN COMMANDS                       ║
╠════════════════════════════════════════════════════════════╣
║ Make Admin:                                                 ║
║   SELECT make_admin('email@example.com');                  ║
║                                                            ║
║ Remove Admin:                                              ║
║   SELECT remove_admin('email@example.com');                ║
║                                                            ║
║ Check Status:                                              ║
║   SELECT is_email_admin('email@example.com');              ║
║                                                            ║
║ List All Admins:                                           ║
║   SELECT * FROM list_all_admins();                         ║
║                                                            ║
║ Bulk Add (multiple at once):                               ║
║   SELECT bulk_make_admins(ARRAY[                           ║
║     'user1@example.com',                                   ║
║     'user2@example.com'                                    ║
║   ]);                                                      ║
╚════════════════════════════════════════════════════════════╝
*/

