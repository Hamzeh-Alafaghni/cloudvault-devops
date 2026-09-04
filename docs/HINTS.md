# 🧩 Hints Index

All the "your challenge" areas and where their hints live. Each linked doc is
**questions, constraints, and acceptance criteria** — never a copy-paste solution.

| Area | Hints | What you build |
|------|-------|----------------|
| AWS architecture design | [ARCHITECTURE_CHALLENGE.md](ARCHITECTURE_CHALLENGE.md) | Diagram + SG matrix + the design the IaC implements |
| Infrastructure as Code | [../terraform/HINTS.md](../terraform/HINTS.md) | VPC, subnets, SGs, S3, IAM in Terraform |
| Kubernetes | [../k8s/HINTS.md](../k8s/HINTS.md) | Deployments, Services, probes, Ingress, CronJob, kustomize |
| CI | [../.github/workflows/ci.yml](../.github/workflows/ci.yml) | lint → test → build → Trivy → push to GHCR |
| CD | [../.github/workflows/cd.yml](../.github/workflows/cd.yml) | deploy → smoke test → rollback |
| Backups | [../scripts/backup.sh](../scripts/backup.sh) · [../scripts/restore.sh](../scripts/restore.sh) | Dump DBs → S3 → prune; restore + verify |
| Container hardening | any `services/*/Dockerfile` | Multi-stage, non-root, slim, pinned |
| Observability (stretch) | [../monitoring/HINTS.md](../monitoring/HINTS.md) | Prometheus + Grafana |

Start from [`../CHALLENGE.md`](../CHALLENGE.md) for the phased milestones, the
Definition of Done per phase, and the grading rubric.

## How to read a hint
- A **question** ("how many subnet tiers?") is a prompt to reason, not a riddle
  with one blessed answer — justify your choice.
- A **constraint** ("$0", "no EKS", "no secrets in Git") is non-negotiable.
- An **acceptance criterion** ("done when: the bucket is private AND downloads
  work via presigned URL AND no keys are in Git") is how you (and the grader)
  know a step is actually finished.
- A **link to official docs** is a hint. Pointing you at the manual is fair game;
  handing you the finished resource block is not.
