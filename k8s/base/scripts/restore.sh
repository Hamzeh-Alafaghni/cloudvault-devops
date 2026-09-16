#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <database_name> <backup_file_name_or_latest>"
  exit 1
fi

DB=$1
BACKUP_REQ=$2
BUCKET=${S3_BUCKET:-cloudvault}
S3_ENDPOINT_FLAG=""

if [ -n "${S3_ENDPOINT:-}" ]; then
  S3_ENDPOINT_FLAG="--endpoint-url ${S3_ENDPOINT}"
fi

case $DB in
  authdb) HOST=${AUTH_DB_HOST:-auth-db}; USER=${AUTH_DB_USER:-auth}; PASS=${AUTH_DB_PASSWORD:-authpass} ;;
  filesdb) HOST=${FILES_DB_HOST:-files-db}; USER=${FILES_DB_USER:-files}; PASS=${FILES_DB_PASSWORD:-filespass} ;;
  notifdb) HOST=${NOTIF_DB_HOST:-files-db}; USER=${NOTIF_DB_USER:-files}; PASS=${FILES_DB_PASSWORD:-filespass} ;;
  *) echo "Unknown database: $DB"; exit 1 ;;
esac

if [ "$BACKUP_REQ" = "latest" ]; then
  echo "Finding latest backup for $DB..."
  LATEST_FILE=$(aws s3 ls "s3://${BUCKET}/backups/${DB}/" $S3_ENDPOINT_FLAG | sort | tail -n 1 | awk '{print $4}')
  if [ -z "$LATEST_FILE" ]; then
    echo "No backups found for $DB."
    exit 1
  fi
  BACKUP_REQ=$LATEST_FILE
fi

echo "Restoring $DB from $BACKUP_REQ..."
aws s3 cp "s3://${BUCKET}/backups/${DB}/${BACKUP_REQ}" "/tmp/${BACKUP_REQ}" $S3_ENDPOINT_FLAG

echo "Dropping and recreating $DB..."
PGPASSWORD=$PASS dropdb -h "$HOST" -U "$USER" --if-exists "$DB"
PGPASSWORD=$PASS createdb -h "$HOST" -U "$USER" "$DB"

echo "Applying dump..."
gunzip -c "/tmp/${BACKUP_REQ}" | PGPASSWORD=$PASS pg_restore -h "$HOST" -U "$USER" -d "$DB" -1

rm -f "/tmp/${BACKUP_REQ}"
echo "Restore of $DB completed successfully."
