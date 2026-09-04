# =============================================================================
# 🧩 modules/iam — least-privilege identities. TODO(student).
# =============================================================================
# QUESTIONS TO ANSWER IN CODE:
#   - The services need to read/write ONE S3 bucket. What is the LEAST-privilege
#     way to grant that? Scope actions AND the resource ARN — not "s3:*" on "*".
#   - What should you NEVER do? (hint: bake long-lived access keys into env vars
#     or images). What is the credential-free alternative for compute? (roles /
#     instance profiles; on a real cluster, per-pod roles.)
#   - Separate roles per concern: app role vs. backup role — do they need the same
#     permissions? (No.) Why does that separation matter?
#
# ACCEPTANCE CRITERIA:
#   done when: policies name specific actions + the specific bucket ARN, there are
#   no long-lived keys anywhere, and removing any one permission breaks exactly
#   one intended capability (proving it's minimal).
#
# TODO(student): implement roles, policies, and instance profiles here.
