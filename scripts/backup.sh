#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
BUCKET=${S3_BUCKET:-cloudvault}
S3_ENDPOINT_FLAG=""

if [ -n "${S3_ENDPOINT:-}" ]; then
  S3_ENDPOINT_FLAG="--endpoint-url ${S3_ENDPOINT}"
fi

for DB in authdb filesdb notifdb; do
  case $DB in
    authdb) HOST=${AUTH_DB_HOST:-auth-db}; USER=${AUTH_DB_USER:-auth}; PASS=${AUTH_DB_PASSWORD:-authpass} ;;
    filesdb) HOST=${FILES_DB_HOST:-files-db}; USER=${FILES_DB_USER:-files}; PASS=${FILES_DB_PASSWORD:-filespass} ;;
    notifdb) HOST=${NOTIF_DB_HOST:-files-db}; USER=${NOTIF_DB_USER:-files}; PASS=${FILES_DB_PASSWORD:-filespass} ;;
  esac

  FILE_NAME="${DB}-${TIMESTAMP}.sql.gz"
  echo "Backing up ${DB} to ${FILE_NAME}..."

  PGPASSWORD=$PASS pg_dump -h "$HOST" -U "$USER" -d "$DB" -Fc | gzip > "/tmp/${FILE_NAME}"
  
  aws s3 cp "/tmp/${FILE_NAME}" "s3://${BUCKET}/backups/${DB}/${FILE_NAME}" $S3_ENDPOINT_FLAG
  rm -f "/tmp/${FILE_NAME}"
done

echo "Backup completed successfully."
