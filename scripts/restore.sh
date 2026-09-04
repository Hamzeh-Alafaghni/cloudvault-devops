#!/usr/bin/env bash
# =============================================================================
# 🧩 restore.sh — STUB. This is YOUR work (graded). Do not expect it to run yet.
# =============================================================================
# GOAL
#   Restore a chosen backup (produced by backup.sh) into a target database, and
#   PROVE that CloudVault comes back to a working state afterwards.
#
# WHAT A DONE SOLUTION MUST DO (acceptance criteria)
#   [ ] Take arguments: which database, and which backup (e.g. "latest" or a key).
#   [ ] Fetch the dump from S3, decompress, and restore it into the target DB.
#   [ ] Be safe: refuse to clobber a non-empty DB unless an explicit --force is given.
#   [ ] After restore, run a sanity check (row counts / a known record) and report.
#   [ ] Exit non-zero on failure.
#
# HINTS (questions — NOT commands)
#   - What is your Recovery Point Objective (RPO) and Recovery Time Objective (RTO)?
#     How does backup frequency relate to RPO?
#   - How do you list available backups and pick the newest deterministically?
#   - What's the difference between restoring into a fresh DB vs. an existing one?
#     Which does your pipeline assume?
#   - Rehearse it: schedule a periodic restore into a throwaway DB to keep the
#     "backups actually work" guarantee honest.
#
# Definition of done for the whole backup/restore milestone:
#   You can delete a database, run restore.sh, and the app works again — demonstrated.
# =============================================================================
set -euo pipefail

echo "restore.sh is a stub — implement it. See the header for acceptance criteria."
echo "TODO(student): fetch backup from S3 -> decompress -> restore -> verify."
exit 2
