#!/bin/bash

# Backup only the main tables (protections, partners, admins)
# Simpler and faster than full database backup

BACKUP_DIR="./Backups/Supabase_db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backing up main tables..."

# Load environment
if [ ! -f "sec.env" ]; then
    echo "Error: sec.env file not found!"
    exit 1
fi

source sec.env

PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Backup each table
TABLES=("protections" "partners" "admins")

for TABLE in "${TABLES[@]}"; do
    echo "Backing up table: $TABLE"
    BACKUP_FILE="$BACKUP_DIR/${TABLE}_backup_${DATE}.sql"
    
    PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
      -h $DB_HOST \
      -p $DB_PORT \
      -U $DB_USER \
      -d $DB_NAME \
      --table=public.$TABLE \
      --data-only \
      --column-inserts \
      -f "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✓ $TABLE backed up successfully to $BACKUP_FILE"
    else
        echo "✗ Failed to backup $TABLE"
    fi
done

echo ""
echo "Backup complete! Files saved in $BACKUP_DIR"

