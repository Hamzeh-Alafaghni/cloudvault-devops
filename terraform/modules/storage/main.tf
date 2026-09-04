# =============================================================================
# 🧩 modules/storage — the S3 bucket (and any managed DB). TODO(student).
# =============================================================================
# QUESTIONS TO ANSWER IN CODE:
#   - The bucket must be PRIVATE. What settings enforce that (public access block,
#     ownership, default encryption)? How do downloads still work? (presigned URLs
#     — the app already does this; you provide a private bucket.)
#   - Should object versioning be on? What does it buy you for the backup story?
#   - If you provision managed Postgres instead of containers: which subnet tier?
#     Which security group may reach it? (coordinate with compute + network)
#
# ACCEPTANCE CRITERIA:
#   done when: the bucket is private AND the app can still upload/download via
#   presigned URLs AND no credentials are committed to Git.
#
# TODO(student): implement resource "aws_s3_bucket" (+ hardening) and optional DB here.
