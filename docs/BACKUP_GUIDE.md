# Supabase Data Backup Guide

This guide explains multiple ways to backup your Supabase data.

## 🎯 Quick Backup Options

### Option 1: CSV Export (Easiest - No Technical Skills Required)

**Best for:** Quick exports, sharing data, Excel analysis

1. Go to your Admin Dashboard
2. Navigate to **Admin → All Protections**
3. Apply any filters if needed
4. Click **📥 Export to CSV** button
5. File downloads automatically with all protection data

**Pros:**
- ✅ No command line needed
- ✅ Works in browser
- ✅ Can open in Excel/Google Sheets
- ✅ Easy to share

**Cons:**
- ❌ Manual process
- ❌ Only exports what's visible (filtered data)
- ❌ Doesn't backup structure (only data)

---

### Option 2: Supabase Dashboard Export

**Best for:** One-time exports, simple backups

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor**
4. Select a table (protections, partners, admins)
5. Click **⋯** menu → **Export to CSV**
6. Repeat for each table

**Pros:**
- ✅ Official Supabase feature
- ✅ No installation needed
- ✅ Direct from source

**Cons:**
- ❌ Manual for each table
- ❌ Doesn't backup schema/structure

---

### Option 3: Automated Script Backups (Recommended)

**Best for:** Regular backups, complete database snapshots

#### Prerequisites:
```bash
# Install PostgreSQL client (includes pg_dump)
# Mac:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Windows:
# Download from https://www.postgresql.org/download/windows/
```

#### Setup:

1. **Add database password to sec.env:**
```bash
# Add this line to your sec.env file
SUPABASE_DB_PASSWORD=your_database_password
```

To find your database password:
- Go to Supabase Dashboard → Settings → Database
- Look for "Database Password" or reset it

2. **Make backup scripts executable:**
```bash
chmod +x backup_database.sh
chmod +x backup_tables_only.sh
```

#### Usage:

**Full Database Backup:**
```bash
./backup_database.sh
```
- Creates complete backup with schema and data
- Saves to `Backups/Supabase_db/full_backup_YYYYMMDD_HHMMSS.sql`
- Automatically keeps last 10 backups

**Tables Only Backup:**
```bash
./backup_tables_only.sh
```
- Faster, smaller files
- Backs up only data from main tables
- Good for daily backups

---

### Option 4: Scheduled Automatic Backups

**Best for:** Set it and forget it

#### Using Cron (Mac/Linux):

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd /path/to/The10KPromise && ./backup_database.sh >> backup.log 2>&1

# Or for weekly backups (Sunday at 3 AM)
0 3 * * 0 cd /path/to/The10KPromise && ./backup_database.sh >> backup.log 2>&1
```

#### Using Supabase Pro Plan:
- Upgrade to Pro plan ($25/month)
- Get automatic daily backups
- Point-in-Time Recovery (PITR)
- Backups kept for 7 days

---

## 📦 Backup Strategy Recommendations

### Minimal Strategy (Free):
- **Weekly:** Run `./backup_database.sh` manually
- **Before major changes:** Run backup script
- **Monthly:** Download CSV exports

### Recommended Strategy:
- **Daily:** Automated script backups (cron)
- **Weekly:** Download and store off-site (Dropbox, Google Drive)
- **Before deployments:** Manual backup

### Enterprise Strategy:
- **Upgrade to Supabase Pro** ($25/month)
- **Daily automated backups** (built-in)
- **Weekly offsite backups** (script + cloud storage)
- **Point-in-Time Recovery** available

---

## 🔄 How to Restore from Backup

### Restore from SQL Backup:

```bash
# Load environment
source sec.env

PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')
DB_HOST="db.${PROJECT_REF}.supabase.co"

# Restore from backup file
PGPASSWORD=$SUPABASE_DB_PASSWORD psql \
  -h $DB_HOST \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f Backups/Supabase_db/full_backup_20231201_120000.sql
```

### Restore from CSV:
1. Go to Supabase Dashboard → Table Editor
2. Select the table
3. Delete existing rows (if needed)
4. Click **Insert** → **Import from CSV**
5. Upload your CSV file

---

## 📊 What Gets Backed Up?

### Full Backup (`backup_database.sh`):
- ✅ All tables (protections, partners, admins)
- ✅ Database schema and structure
- ✅ Indexes and constraints
- ✅ Views and functions
- ✅ Sequences (ID counters)

### Table Backup (`backup_tables_only.sh`):
- ✅ Data from protections, partners, admins tables
- ❌ Schema structure
- ❌ Views and functions

### CSV Export:
- ✅ Visible data only
- ❌ Schema structure
- ❌ Hidden columns

---

## 🚨 Important Notes

1. **Keep sec.env secure** - Never commit to git
2. **Test restores** - Verify backups work before you need them
3. **Store offsite** - Keep copies outside your computer
4. **Regular schedule** - Automate backups to avoid forgetting
5. **Verify backups** - Check file sizes and dates regularly

---

## 📞 Quick Reference

| Method | Difficulty | Automation | Completeness |
|--------|-----------|------------|--------------|
| CSV Export | Easy | Manual | Partial |
| Dashboard Export | Easy | Manual | Partial |
| Script Backup | Medium | Can Automate | Complete |
| Supabase Pro | Easy | Automatic | Complete |

---

## 🆘 Troubleshooting

**"pg_dump: command not found"**
- Install PostgreSQL client (see prerequisites)

**"password authentication failed"**
- Check SUPABASE_DB_PASSWORD in sec.env
- Reset database password in Supabase Dashboard

**"connection refused"**
- Check your internet connection
- Verify PROJECT_REF is correct
- Check if Supabase is down (status.supabase.com)

**Backup file is empty**
- Check database password
- Verify tables have data
- Check permissions

---

## 📚 Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Your Supabase Project Dashboard](https://supabase.com/dashboard)

