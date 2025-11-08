# How to Make Someone an Admin

## ⚡ SUPER EASY METHOD (Recommended!)

**Just run ONE command with their email:**

```sql
SELECT make_admin('user@example.com');
```

That's it! ✅

### Setup (One-Time):
1. Go to Supabase → SQL Editor
2. Run the SQL from `admin_management_functions.sql` (one time setup)
3. Now you can use the easy commands!

### Quick Commands:
```sql
-- Make admin
SELECT make_admin('user@example.com');

-- Remove admin
SELECT remove_admin('user@example.com');

-- Check if admin
SELECT is_email_admin('user@example.com');

-- List all admins
SELECT * FROM list_all_admins();
```

📖 **Full guide:** See `EASY_ADMIN_MANAGEMENT.md`

---

## 🔐 Manual Method (If You Prefer)

Admins are assigned **manually** through Supabase backend only (no UI). This gives you complete control over who has admin access.

## 📋 Step-by-Step Process

### Step 1: Get the User's UUID

**Option A: From Supabase Dashboard**
1. Go to your Supabase project
2. Click **Authentication** → **Users**
3. Find the user by email
4. Copy their **UUID** (the long string like `123e4567-e89b-12d3-a456-426614174000`)

**Option B: Using SQL**
```sql
SELECT id, email, raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'user@example.com';
```

### Step 2: Add User to Admins Table

**Option A: Using Supabase Table Editor**
1. Go to **Table Editor** → **admins** table
2. Click **"+ Insert row"**
3. Fill in:
   - `user_id`: Paste the UUID from Step 1
   - `note`: (Optional) e.g., "John Smith - Regional Manager"
4. Click **Save**

**Option B: Using SQL Editor**
```sql
INSERT INTO public.admins (user_id, note) 
VALUES ('paste-uuid-here', 'Optional note about this admin');
```

### Step 3: Verify

1. Have the user sign out and sign in again
2. They should now see:
   - 🔐 **Admin Panel** section on their dashboard
   - Access to `/admin/partners` (Partner Management)
   - Access to `/admin/upload` (CSV Upload)

## ⚠️ Important Notes

- **User must have logged in at least once** for their account to exist
- **User must complete their profile** (first time login) before accessing admin features
- **Changes take effect immediately** (user needs to refresh or re-login)
- **No way to promote through UI** - this is intentional for security

## 🗑️ To Remove Admin Access

**Using Table Editor:**
1. Go to **Table Editor** → **admins**
2. Find the user's row
3. Click the trash icon to delete
4. Confirm deletion

**Using SQL:**
```sql
DELETE FROM public.admins 
WHERE user_id = 'uuid-of-user-to-remove';
```

## 📊 View All Current Admins

```sql
SELECT 
  a.user_id,
  a.note,
  u.email,
  u.raw_user_meta_data->>'full_name' as name,
  a.created_at
FROM public.admins a
JOIN auth.users u ON u.id = a.user_id
ORDER BY a.created_at DESC;
```

## 🔍 Check If Someone Is Admin

```sql
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.admins WHERE user_id = 'uuid-here')
    THEN 'Yes - Is Admin'
    ELSE 'No - Not Admin'
  END as admin_status;
```

## 💡 Best Practices

1. **Document admins**: Use the `note` field to track why someone is admin
2. **Regular audits**: Periodically review the admins table
3. **Least privilege**: Only grant admin to those who absolutely need it
4. **Remove access**: When someone leaves or changes roles, remove them immediately

## 🆘 Troubleshooting

### User says they don't see admin features:

**Check 1**: Is user in admins table?
```sql
SELECT * FROM public.admins WHERE user_id = 'their-uuid';
```

**Check 2**: Did they refresh after being added?
- Have them sign out and sign in again
- Or just refresh the page

**Check 3**: Did they complete their profile?
- They need first_name, last_name, and hgi_partner_id filled

**Check 4**: Check browser console for errors
- Press F12 → Console tab
- Look for any red error messages

### I can't find the user's UUID:

They might not have logged in yet. Ask them to:
1. Go to the app
2. Sign in with Google
3. Complete their profile
4. Then you can find them in auth.users

## 📧 Email Template for New Admins

```
Subject: Admin Access Granted - The10KPromise

Hi [Name],

You've been granted admin access to The10KPromise app!

As an admin, you can now:
✅ View and edit all partner information
✅ Upload CSV files with protection records  
✅ Manage partner profiles and HGI Partner IDs

To access admin features:
1. Sign in at [your-app-url]
2. Look for the 🔐 Admin Panel section on your dashboard
3. Click "Partners" to manage partners or "CSV Upload" to import records

If you have any questions, feel free to reach out!

Best,
[Your Name]
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Make admin | `INSERT INTO admins (user_id) VALUES ('uuid')` |
| Remove admin | `DELETE FROM admins WHERE user_id = 'uuid'` |
| List admins | `SELECT * FROM admins JOIN auth.users ON...` |
| Check if admin | `SELECT * FROM admins WHERE user_id = 'uuid'` |

That's it! Simple and secure. 🔒

