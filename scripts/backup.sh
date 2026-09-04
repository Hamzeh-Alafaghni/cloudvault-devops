#!/usr/bin/env bash
# =============================================================================
# 🧩 backup.sh — STUB. This is YOUR work (graded). Do not expect it to run yet.
# =============================================================================
# GOAL
#   Produce a reliable, restorable backup of CloudVault's stateful data and put
#   it somewhere durable and off-box.
#
# WHAT A DONE SOLUTION MUST DO (acceptance criteria)
#   [ ] Dump EACH Postgres database (authdb, filesdb, notifdb) consistently.
#   [ ] Write each dump to a TIMESTAMPED, greppable object key
#       (e.g. backups/<db>/<YYYY-MM-DDTHH-MM-SSZ>.sql.gz) in the S3 bucket.
#   [ ] Compress dumps; verify the upload succeeded before deleting anything local.
#   [ ] Prune backups older than a retention window (e.g. keep 7 daily).
#   [ ] Exit non-zero on ANY failure so a CronJob/pipeline can alert.
#   [ ] Never print or embed credentials; read them from the environment.
#
# HINTS (questions to answer — NOT commands to copy)
#   - Which pg tool gives a consistent single-database dump? What flags make it
#     restore cleanly onto an empty database?
#   - Why is `set -euo pipefail` important in a backup script? What breaks silently
#     without `pipefail` when you pipe a dump into gzip into an uploader?
#   - What timestamp format sorts lexicographically AND is filesystem/S3-safe?
#   - How will you PROVE a backup is restorable (see restore.sh)? A backup you have
#     never restored is a hope, not a backup.
#   - Where do the DB host/user/password come from in local dev vs. in k8s? (Hint:
#     env vars locally; a Secret + a CronJob in k8s. See k8s/HINTS.md.)
#   - Least privilege: what S3 permissions does this job actually need? (Not "*".)
#
# WHERE THIS RUNS
#   Locally you might invoke it by hand; in the cluster it becomes a CronJob
#   (see k8s/HINTS.md). The AWS design question (which subnet, which IAM role)
#   is in docs/ARCHITECTURE_CHALLENGE.md.
#
# Official docs are fair game: PostgreSQL pg_dump, AWS S3 CLI, Kubernetes CronJob.
# =============================================================================
set -euo pipefail

echo "backup.sh is a stub — implement it. See the header for acceptance criteria."
echo "TODO(student): dump each Postgres DB -> gzip -> timestamped S3 key -> prune old backups."
exit 2
