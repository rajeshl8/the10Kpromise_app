# Quick Backup Guide

## 🚀 Super Easy - 3 Steps to Backup Your Data

### Step 1: Add Your Database Password

Edit your `sec.env` file and add this line:

```bash
SUPABASE_DB_PASSWORD=your_actual_password_here
```

**Where to find your password:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Look for "Database Password" (or click "Reset Database Password")

### Step 2: Run the Backup

Open Terminal and run:

```bash
cd /Users/rajeshlingam/Documents/Protect10K/The10KPromise
./backup_database.sh
```

That's it! Your backup will be saved to `Backups/Supabase_db/`

### Step 3: Verify It Worked

Check that the file was created:

```bash
ls -lh Backups/Supabase_db/
```

You should see a file like `full_backup_20231201_143022.sql`

---

## 📋 All Backup Options

### Option 1: Full Database Backup (Recommended)
```bash
./backup_database.sh
```
- Complete backup with everything
- Keeps last 10 backups automatically
- Use this for weekly backups

### Option 2: Quick Table Backup (Faster)
```bash
./backup_tables_only.sh
```
- Just the data (protections, partners, admins)
- Smaller, faster
- Use this for daily backups

### Option 3: CSV Export (No Terminal Needed!)
1. Go to your website Admin page
2. Click **Admin → All Protections**
3. Click **📥 Export to CSV**
4. File downloads automatically!

---

## ⏰ Set Up Automatic Daily Backups

Run this once to set up daily automatic backups at 2 AM:

```bash
# Open cron editor
crontab -e

# Add this line (press 'i' to insert, then paste):
0 2 * * * cd /Users/rajeshlingam/Documents/Protect10K/The10KPromise && ./backup_database.sh >> backup.log 2>&1

# Press ESC, then type :wq and press ENTER to save
```

Now your database backs up automatically every night!

---

## 🔄 How to Restore a Backup

If you ever need to restore (hopefully never!):

```bash
source sec.env
PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

PGPASSWORD=$SUPABASE_DB_PASSWORD psql \
  -h db.${PROJECT_REF}.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f Backups/Supabase_db/full_backup_20231201_143022.sql
```

---

## 💡 Pro Tips

1. **Test Your Backups** - Run a backup now to make sure it works
2. **Store Offsite** - Copy backups to Google Drive, Dropbox, etc.
3. **Before Big Changes** - Always backup before major updates
4. **Check File Size** - Backup should be several KB/MB (not 0 bytes)
5. **Keep Multiple Versions** - Scripts automatically keep 10 backups

---

## 🆘 Troubleshooting

**Problem:** "Permission denied"
```bash
chmod +x backup_database.sh backup_tables_only.sh
```

**Problem:** "pg_dump: command not found"
```bash
brew install postgresql
```

**Problem:** "password authentication failed"
- Check your SUPABASE_DB_PASSWORD in sec.env
- Make sure you copied it correctly

**Problem:** Backup file is 0 bytes
- Check internet connection
- Verify database password
- Check Supabase project is running

---

## 📞 Need Help?

Read the full guide: `docs/BACKUP_GUIDE.md`

---

## ✅ Quick Checklist

- [ ] PostgreSQL tools installed ✓ (you have it!)
- [ ] Added SUPABASE_DB_PASSWORD to sec.env
- [ ] Tested backup with `./backup_database.sh`
- [ ] Verified backup file exists and has size > 0
- [ ] (Optional) Set up automatic backups with cron
- [ ] (Optional) Copy backup to cloud storage

**You're all set! Your data is safe! 🎉**

