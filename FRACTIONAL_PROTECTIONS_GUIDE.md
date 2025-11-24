# Fractional Protections Guide (0.5 Credit Sharing)

## 📋 Overview

The system now supports **fractional protections** where two partners can share credit for protecting a single family.

**Use Case:** Partner A helps Partner B close a deal. Each partner can claim 0.5 credit, totaling 1.0 protection.

---

## 🎯 How It Works

### **Full Credit (Default):**
- Protection Count: **1.0**
- One partner gets full credit for one family

### **Shared Credit:**
- Protection Count: **0.5**
- Two partners each get 0.5 credit for the same family
- Combined: **0.5 + 0.5 = 1.0 family protected**

---

## 📤 CSV Upload Format

### **Sample CSV Structure:**

```csv
Partner First Name,Partner Last Name,HGI Partner ID,Partner Email,Client State,Product Type,Promise Date,Source of Client,Protection Count,Family Notes
John,Smith,HGI001,john@example.com,CA,Legacy Plan,2025-01-15,Referral,1.0,Full credit
Jane,Doe,HGI002,jane@example.com,TX,Financial Security Plan,2025-01-20,Personal,0.5,Shared with Bob
Bob,Wilson,HGI003,bob@example.com,TX,Financial Security Plan,2025-01-20,Personal,0.5,Shared with Jane
```

### **Key Points:**

1. **Protection Count Column** - Required in CSV
   - Valid values: `0.5`, `1`, `1.0`
   - Default if missing: `1.0`
   - Must be between 0.0 and 1.0

2. **Shared Credit Example:**
   - Row 1: Jane Doe gets 0.5 credit
   - Row 2: Bob Wilson gets 0.5 credit
   - Same family, same date = Shared credit

3. **Full Credit Example:**
   - John Smith gets 1.0 credit (full protection)

---

## 📊 Dashboard & Leaderboard

### **All counts are now SUM instead of COUNT:**

**Global Counter:**
- Counts total credit (not total records)
- Example: 100 records with 50 @ 1.0 and 50 @ 0.5 = **75 families protected**

**Partner Dashboard:**
- Shows their total credit
- Example: 10 full (1.0) + 4 shared (0.5) = **12.0 families**

**Leaderboard:**
- Ranks by total credit
- Example: Partner with 20 @ 1.0 and 10 @ 0.5 = **25.0 total**

---

## 🔧 Database Changes

### **New Column:**
```sql
ALTER TABLE public.protections 
ADD COLUMN protection_count numeric(3,2) DEFAULT 1.0 NOT NULL
CHECK (protection_count > 0 AND protection_count <= 1.0);
```

### **Updated Views:**
- `protection_metrics` - Uses `SUM(protection_count)`
- `partner_stats` - Uses `SUM(protection_count)`
- `leaderboard` - Uses `SUM(protection_count)`

---

## 📝 Examples

### **Example 1: Full Credit**
```csv
Partner First Name,Partner Last Name,HGI Partner ID,Partner Email,Client State,Product Type,Promise Date,Source of Client,Protection Count,Family Notes
Alice,Johnson,HGI100,alice@example.com,CA,Legacy Plan,2025-01-15,Referral,1.0,Closed deal solo
```
**Result:** Alice gets 1.0 credit

---

### **Example 2: Shared Credit**
```csv
Partner First Name,Partner Last Name,HGI Partner ID,Partner Email,Client State,Product Type,Promise Date,Source of Client,Protection Count,Family Notes
Bob,Smith,HGI101,bob@example.com,NY,Financial Security Plan,2025-01-20,Personal,0.5,Shared with Carol
Carol,Davis,HGI102,carol@example.com,NY,Financial Security Plan,2025-01-20,Personal,0.5,Shared with Bob
```
**Result:** 
- Bob gets 0.5 credit
- Carol gets 0.5 credit
- Total: 1.0 family protected

---

### **Example 3: Mixed**
```csv
Partner First Name,Partner Last Name,HGI Partner ID,Partner Email,Client State,Product Type,Promise Date,Source of Client,Protection Count,Family Notes
Dave,Wilson,HGI103,dave@example.com,TX,Legacy Plan,2025-01-25,Referral,1.0,Solo deal #1
Dave,Wilson,HGI103,dave@example.com,FL,Financial Security Plan,2025-01-26,Personal,0.5,Shared with Eve
Eve,Brown,HGI104,eve@example.com,FL,Financial Security Plan,2025-01-26,Personal,0.5,Shared with Dave
Dave,Wilson,HGI103,dave@example.com,CA,Legacy Plan,2025-01-27,Referral,1.0,Solo deal #2
```
**Result:** 
- Dave: 1.0 + 0.5 + 1.0 = **2.5 total credit**
- Eve: 0.5 = **0.5 total credit**

---

## ⚠️ Important Rules

1. **Protection Count is REQUIRED** in CSV uploads
2. **Valid range:** 0.01 to 1.0
3. **Common values:** 0.5 (shared) or 1.0 (full)
4. **Default:** 1.0 (if column missing in old CSVs)
5. **Backwards Compatible:** Old CSVs without this column will auto-assign 1.0

---

## 🚀 Migration Steps

### **Step 1: Run Migration in Supabase**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy contents of `migration_add_fractional_protections.sql`
3. Run the script

### **Step 2: Verify**
```sql
-- Check that all existing protections got 1.0
SELECT 
  COUNT(*) as total_records,
  SUM(protection_count) as total_credit
FROM protections
WHERE status = 'approved' AND deleted_at IS NULL;
```

### **Step 3: Test CSV Upload**
1. Download updated `sample-upload.csv`
2. Add test data with 0.5 and 1.0 values
3. Upload via `/admin/upload`
4. Verify counts on dashboard

---

## 📊 Verification Queries

### **Check Global Count:**
```sql
SELECT * FROM protection_metrics;
-- Should show SUM of all protection_count values
```

### **Check Partner Stats:**
```sql
SELECT 
  display_name,
  completed_count
FROM partner_stats
ORDER BY completed_count DESC;
-- completed_count is now SUM, not COUNT
```

### **Check Individual Partner:**
```sql
SELECT 
  p.display_name,
  COUNT(pr.id) as total_records,
  SUM(pr.protection_count) as total_credit
FROM partners p
LEFT JOIN protections pr ON pr.partner_user_id = p.user_id
WHERE p.email = 'partner@example.com'
  AND pr.status = 'approved'
  AND pr.deleted_at IS NULL
GROUP BY p.display_name;
```

---

## 🎉 Benefits

✅ **Fair Credit** - Partners who collaborate get recognized
✅ **Accurate Counting** - Reflects actual families protected
✅ **Flexible** - Support any split (0.5/0.5 is most common)
✅ **Backwards Compatible** - Old data automatically gets 1.0
✅ **No UI Changes Needed** - Works via CSV upload only (for now)

---

## 📞 Support

If you encounter issues:
1. Check that Protection Count is between 0.0 and 1.0
2. Verify CSV column header is exactly "Protection Count"
3. Ensure decimal format (0.5 or 1.0, not fractions like 1/2)
4. Run verification queries above

---

## 🔮 Future Enhancements

- [ ] Add Protection Count field to manual "Protect Family" form
- [ ] UI indicator for shared credit (0.5 badge)
- [ ] Report showing all shared protections
- [ ] Validation to prevent duplicate 1.0 entries for same family

---

**Last Updated:** January 24, 2025
**Version:** 1.0

