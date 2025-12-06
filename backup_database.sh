#!/bin/bash

# Supabase Database Backup Script
# This script creates a full backup of your Supabase database

# Configuration
BACKUP_DIR="./Backups/Supabase_db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/full_backup_$DATE.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Supabase Database Backup Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if Supabase is configured
if [ ! -f "sec.env" ]; then
    echo -e "${RED}Error: sec.env file not found!${NC}"
    echo "Please create sec.env with your Supabase credentials:"
    echo "  SUPABASE_URL=your_project_url"
    echo "  SUPABASE_DB_PASSWORD=your_database_password"
    exit 1
fi

# Load environment variables
source sec.env

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}Error: Could not extract project reference from SUPABASE_URL${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting backup...${NC}"
echo "Project: $PROJECT_REF"
echo "Backup file: $BACKUP_FILE"
echo ""

# Backup using pg_dump
# You'll need to install PostgreSQL client tools (pg_dump)
# On Mac: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql-client

DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo -e "${YELLOW}Connecting to database...${NC}"

PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --verbose \
  -f "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo -e "${GREEN}File saved to: $BACKUP_FILE${NC}"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}Backup size: $FILE_SIZE${NC}"
    
    # Keep only last 10 backups
    echo ""
    echo -e "${YELLOW}Cleaning old backups (keeping last 10)...${NC}"
    cd "$BACKUP_DIR"
    ls -t full_backup_*.sql | tail -n +11 | xargs -r rm
    echo -e "${GREEN}✓ Cleanup complete${NC}"
else
    echo ""
    echo -e "${RED}✗ Backup failed!${NC}"
    echo -e "${RED}Please check your database credentials and connection.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Total backups in directory: $(ls -1 $BACKUP_DIR/full_backup_*.sql 2>/dev/null | wc -l)"
echo ""

