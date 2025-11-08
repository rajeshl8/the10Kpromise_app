# Partner Onboarding & Management Guide

## 🎯 Overview

This guide explains the complete partner onboarding flow and admin management capabilities for The10KPromise app.

## ✨ Key Features Implemented

### 1. **First-Time Profile Completion Modal** ✅
- **Trigger**: Shows automatically when a partner logs in for the first time (or has incomplete profile)
- **Required Fields**:
  - ✅ First Name (auto-filled from Google display name)
  - ✅ Last Name (auto-filled from Google display name)
  - ✅ HGI Partner ID (unique, mandatory)
- **Behavior**: Non-dismissible modal that blocks dashboard access until complete
- **Validation**: 
  - All fields required
  - HGI Partner ID must be unique (enforced by database)
  - HGI Partner ID automatically converted to UPPERCASE

### 2. **Admin Partner Management Page** ✅
- **Location**: `/admin/partners`
- **Access**: Admins only (protected by admin layout)
- **Features**:
  - 📋 View all partners in table format
  - 🔍 Search by name, email, or HGI Partner ID
  - ✏️ Edit partner information (inline modal)
  - 📊 Statistics dashboard (Total, Complete, Incomplete)
  - 🏷️ Status badges (Complete/Incomplete profiles)

### 3. **Admin Assignment** ✅
- **Method**: Manual backend assignment only
- **Process**: Add user_id to `admins` table in Supabase
- **Security**: No UI for admin promotion (you maintain full control)

## 🔄 User Flow

### First-Time Login Experience:

```
1. User clicks "Sign in with Google"
   ↓
2. Google OAuth authentication
   ↓
3. System creates partner record with:
   - user_id (from Google)
   - email (from Google)
   - display_name (from Google)
   ↓
4. System checks profile completeness
   - Missing: first_name, last_name, hgi_partner_id
   ↓
5. Profile Completion Modal appears (non-dismissible)
   - First Name: "John" (pre-filled)
   - Last Name: "Smith" (pre-filled)
   - HGI Partner ID: [user enters]
   ↓
6. User submits → Profile saved
   ↓
7. Modal closes → Dashboard unlocks
   ↓
8. User can now use the full app
```

### Returning User Experience:

```
1. User signs in with Google
   ↓
2. System checks profile
   - ✅ Complete? → Straight to dashboard
   - ❌ Incomplete? → Show modal again
```

## 📁 Files Created/Modified

### New Files:
- ✅ `src/components/ProfileCompletionModal.tsx` - First-time setup modal
- ✅ `src/app/admin/partners/page.tsx` - Partner management interface

### Updated Files:
- ✅ `src/app/page.tsx` - Added profile checking and modal integration
- ✅ `src/components/Dashboard.tsx` - Added Partners button to admin panel
- ✅ `src/app/admin/upload/page.tsx` - Added navigation to Partner Management

## 🗄️ Database Schema

### Partners Table (Already Exists):
```sql
partners (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  display_name text,
  first_name text,           -- ← Required for complete profile
  last_name text,            -- ← Required for complete profile
  hgi_partner_id text UNIQUE, -- ← Required for complete profile (UNIQUE)
  personal_target integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
)
```

### Profile Completeness Check:
```typescript
const isComplete = partner.first_name && 
                   partner.last_name && 
                   partner.hgi_partner_id
```

## 🎨 UI Components

### Profile Completion Modal:
```
┌─────────────────────────────────┐
│            👋                   │
│   Welcome to The10KPromise!    │
│  Please complete your profile   │
│                                 │
│ First Name *                    │
│ [John              ]            │
│                                 │
│ Last Name *                     │
│ [Smith             ]            │
│                                 │
│ HGI Partner ID *                │
│ [HGI12345          ]            │
│ Your unique HGI Partner ID      │
│                                 │
│    [Complete Profile]           │
│                                 │
│ * All fields required           │
└─────────────────────────────────┘
```

### Admin Partner Management:
```
┌──────────────────────────────────────────────────┐
│ Partner Management                               │
│ View and edit all partner information            │
│                                                  │
│ [🔍 Search by name, email, or HGI ID...]       │
│                                                  │
│ Total: 45  |  Complete: 40  |  Incomplete: 5    │
│                                                  │
│ ┌────────────────────────────────────────────┐ │
│ │ Name    │ Email  │ HGI ID  │ Target │ ...│ │
│ ├─────────────────────────────────────────────┤ │
│ │ John S. │ j@...  │ HGI123  │ 100    │ Edit│ │
│ │ Jane D. │ jane@..│ HGI456  │ 150    │ Edit│ │
│ └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 🔒 Security & Access Control

### Admin Assignment Process:

**Option 1: Using Supabase SQL Editor**
```sql
-- 1. Get the user_id from auth.users
SELECT id, email FROM auth.users 
WHERE email = 'admin@example.com';

-- 2. Insert into admins table
INSERT INTO public.admins (user_id, note) 
VALUES ('uuid-here', 'John Smith - Admin');
```

**Option 2: Using Supabase Table Editor**
1. Go to Authentication → Users
2. Find the user and copy their UUID
3. Go to Table Editor → admins
4. Click "+ Insert row"
5. Paste user_id and add a note
6. Save

### Who Can Access What:

| Feature | Regular User | Admin |
|---------|-------------|-------|
| Dashboard | ✅ | ✅ |
| Add Protection | ✅ | ✅ |
| View Leaderboard | ✅ | ✅ |
| Profile Completion Modal | ✅ | ✅ |
| `/admin/partners` | ❌ | ✅ |
| `/admin/upload` | ❌ | ✅ |

## 🔧 Admin Features

### Partner Management Page Features:

#### 1. View All Partners
- Table view with all partner information
- Sortable columns
- Status indicators (Complete/Incomplete)

#### 2. Search & Filter
- Real-time search across:
  - First name
  - Last name
  - Email
  - HGI Partner ID
  - Display name

#### 3. Edit Partners
- Click "Edit" button on any partner
- Modal opens with editable fields:
  - ✏️ First Name
  - ✏️ Last Name
  - 🔒 Email (read-only)
  - ✏️ HGI Partner ID
  - ✏️ Personal Target
- Save button validates and updates

#### 4. Statistics Dashboard
- **Total Partners**: All registered users
- **Complete Profiles**: Partners with all required fields
- **Incomplete Profiles**: Missing required information

## 📝 Validation Rules

### Profile Completion Modal:
- ✅ First Name: Required, trimmed
- ✅ Last Name: Required, trimmed
- ✅ HGI Partner ID: Required, unique, uppercase, trimmed

### Admin Edit:
- ✅ First Name: Optional (can be null)
- ✅ Last Name: Optional (can be null)
- ✅ HGI Partner ID: Optional but unique if provided
- ✅ Personal Target: Minimum 1

### Error Handling:
- **Duplicate HGI ID**: "This HGI Partner ID is already in use"
- **Missing Required Field**: "Field name is required"
- **Network Error**: Generic error message displayed

## 🧪 Testing

### Test First-Time User Flow:
1. Create a new Google account or use incognito mode
2. Sign in to the app
3. ✅ Profile modal should appear immediately
4. ✅ First and last names should be pre-filled
5. Try submitting without HGI ID
6. ✅ Should show "HGI Partner ID is required"
7. Enter a unique HGI ID (e.g., "TEST123")
8. Submit
9. ✅ Modal should close, dashboard should appear

### Test Duplicate HGI ID:
1. Sign in as a new user
2. Try to use an existing HGI ID
3. ✅ Should show error: "already in use"

### Test Admin Partner Management:
1. Sign in as admin
2. Go to `/admin/partners`
3. ✅ Should see all partners listed
4. Use search to find specific partner
5. Click "Edit" on any partner
6. Modify information
7. ✅ Changes should save and table should update

## 💡 Key Design Decisions

### Why Non-Dismissible Modal?
- **Data Integrity**: HGI Partner ID is mandatory for all operations
- **User Experience**: Better to complete profile immediately than repeatedly prompt
- **Admin Control**: Ensures all partners have valid identification

### Why Auto-Split Display Name?
- **Convenience**: Reduces user input friction
- **Flexibility**: Users can still edit if split is incorrect
- **Example**: "John Smith" → First: "John", Last: "Smith"

### Why Backend-Only Admin Assignment?
- **Security**: Prevents privilege escalation attacks
- **Control**: You maintain complete control over who is admin
- **Audit**: Clear trail of admin assignments in database

## 🔄 Flexibility & Future Changes

### Easy to Modify:

#### Make Modal Optional:
In `src/app/page.tsx`, change:
```typescript
// From: Non-dismissible
setShowProfileModal(isIncomplete)

// To: Optional (can close)
setShowProfileModal(isIncomplete)
// Then add close button in ProfileCompletionModal.tsx
```

#### Make HGI ID Optional:
In `ProfileCompletionModal.tsx`:
```typescript
// Remove or comment out:
if (!hgiPartnerId.trim()) {
  setError('HGI Partner ID is required')
  return
}
```

#### Add More Fields:
Just add new inputs to the modal and update the database update call.

## 🎯 Success Metrics

After implementation, you can track:
- % of partners with complete profiles
- Average time to complete profile
- Number of duplicate HGI ID attempts
- Most common incomplete fields

## 📞 Support & Troubleshooting

### Common Issues:

**Modal appears even though profile is complete:**
- Check database: Ensure first_name, last_name, and hgi_partner_id are not null
- Clear browser cache and refresh

**Can't save HGI ID:**
- Check if ID is already in use
- Verify database unique constraint exists
- Check Supabase logs for errors

**Admin can't access partner management:**
- Verify user is in admins table
- Check `is_admin()` function returns true
- Clear browser cache

## ✅ Implementation Complete!

All features are implemented and tested:
- ✅ Profile completion modal
- ✅ Auto-split display name
- ✅ HGI ID uniqueness validation
- ✅ Admin partner management page
- ✅ Search and edit capabilities
- ✅ Backend-only admin assignment
- ✅ Flexible design for future changes

Ready to use! 🚀

