# 🧩 CloudVault — The Assignment

## The scenario
You've just joined **CloudVault**, a two-person startup with a working file-sharing
product (the code in this repo) and *nothing else*. It runs on a founder's laptop
via `docker compose`. Your job as the first DevOps/platform hire: take this from
"works on my machine" to a **containerized, version-controlled, CI/CD-driven,
infrastructure-as-code, Kubernetes-deployed, backed-up, observable** system —
without spending a cent.

The application is **done and working**. You will **not** rewrite it (except the
optional language-rewrite stretch goal). Everything you build is the platform
*around* it. Every area you touch has a `HINTS.md` or header full of guiding
questions and acceptance criteria — but **no solutions**. Building them is the grade.

### Non-negotiable constraints
- 💸 **$0 budget.** Local Docker Compose for the app; **LocalStack** for S3; a
  **local Kubernetes** cluster (**kind/k3d**) for the cluster milestone; the AWS
  design must fit the **Free Tier**.
- 🚫 **No Amazon EKS.** Its control plane bills hourly. Design for a cluster, run
  it locally.
- 🔐 **No secrets in Git.** Not `.env`, not `*.tfstate`, not a kubeconfig, not a key.
- 📎 **Hints are questions, not commands.** Official docs are fair game; copied
  answers are not.

---

## Phased milestones

Each phase has a **Definition of Done (DoD)**. Don't move on until the DoD holds.

### Phase 0 — Run & understand (warm-up)
Get the app running and trace one upload end-to-end.
- **DoD:** `make up && make seed` works; you can register, upload an image, and see
  the thumbnail + notifications in the UI; you can explain the path an upload takes
  through the services, Redis, Postgres, and S3.

### Phase 1 — Containers & hardening
The images build and run but are deliberately naive (single-stage, root, unpinned).
Harden every service image.
- Multi-stage builds; small base (slim/distroless); **non-root** user; **pinned**
  base by digest; `npm ci --omit=dev` with a committed lockfile; tight `.dockerignore`.
- **DoD:** every image runs as UID ≠ 0, is a fraction of its original size, a
  vulnerability scan (Trivy/Docker Scout) shows no HIGH/CRITICAL *you* introduced,
  and `docker compose up` still brings the app up green.

### Phase 2 — Git flow
Establish a real branching & review workflow (you're a team now, even if it's a team
of one-plus-your-future-self).
- Trunk-based or GitHub Flow; protected `main`; PRs with review; conventional,
  meaningful commits; a `CONTRIBUTING` note describing the flow.
- **DoD:** `main` is protected; every change lands via PR; history is legible.

### Phase 3 — CI
Implement [`.github/workflows/ci.yml`](.github/workflows/ci.yml):
**lint → test → build → Trivy scan → push to GHCR.**
- **DoD:** a PR runs lint + all service tests; images build, get scanned (failing on
  your severity policy), and on merge are pushed to GHCR tagged by commit SHA.

### Phase 4 — IaC & AWS architecture design
Solve [`docs/ARCHITECTURE_CHALLENGE.md`](docs/ARCHITECTURE_CHALLENGE.md) and implement
it under [`terraform/`](terraform) (see [`terraform/HINTS.md`](terraform/HINTS.md)).
- Deliverables: an **architecture diagram**, a **security-group matrix**
  (source → dest → port → reason), and the **Terraform** that implements it, with
  **remote, locking state**.
- **DoD:** `terraform validate` + `plan` succeed (LocalStack or Free-Tier AWS); the
  plan matches your diagram and SG matrix; three subnet tiers across ≥2 AZs; the app
  tier has egress-only internet; least-privilege IAM with **no long-lived keys**.

### Phase 5 — S3 / object storage
Make object storage real and private.
- Private bucket (public access blocked, encryption on, versioning considered);
  the app still uploads and downloads via **presigned URLs**; access granted by a
  role, not keys.
- **DoD:** the bucket is private **AND** downloads work via presigned URL **AND** no
  keys are in Git.

### Phase 6 — Kubernetes
Deploy the whole app to **kind/k3d** using [`k8s/`](k8s) (see
[`k8s/HINTS.md`](k8s/HINTS.md)).
- Deployments + Services per service; **liveness → `/healthz`**, **readiness →
  `/readyz`**; ConfigMaps + Secrets; a **PVC-backed** Postgres; an **Ingress**
  exposing only the gateway; **kustomize** base + `dev`/`prod` overlays.
- **DoD:** `kubectl apply -k k8s/overlays/dev` brings the app up; the full flow
  works through the Ingress; readiness gates traffic; secrets aren't committed.

### Phase 7 — CD + backups + rollback
Automate delivery and prove you can recover.
- Implement [`.github/workflows/cd.yml`](.github/workflows/cd.yml): deploy → smoke
  test → **auto-rollback** on failure.
- Implement [`scripts/backup.sh`](scripts/backup.sh) + [`scripts/restore.sh`](scripts/restore.sh)
  and the backup **CronJob** in k8s.
- **DoD:** a merge to `main` deploys automatically, smoke-tests, and rolls back on a
  deliberately-broken deploy; a scheduled backup lands a timestamped object in the
  bucket; you can **delete a database, restore it, and the app works again —
  demonstrated**.

---

## Definition of Done — the whole project
- [ ] Every service image is hardened (multi-stage, non-root, pinned, scanned).
- [ ] CI runs lint + tests + build + scan and publishes images to GHCR.
- [ ] Terraform implements your documented AWS design (diagram + SG matrix), with
      remote locking state, least-privilege IAM, and a private S3 bucket.
- [ ] The app runs on a local Kubernetes cluster via kustomize overlays, with
      probes, config/secrets, persistent DB storage, and an Ingress.
- [ ] CD deploys on merge, smoke-tests, and auto-rolls-back on failure.
- [ ] Backups run on a schedule and a restore has been demonstrated end-to-end.
- [ ] No secrets, `.env`, or state files are committed anywhere in history.

---

## Grading rubric (100 pts)

| Area | Pts | What "excellent" looks like |
|---|---:|---|
| **Containers & hardening** | 12 | Multi-stage, non-root, pinned digests, tiny images, clean scans; app still works. |
| **Git flow & hygiene** | 8 | Protected main, PR reviews, legible history, no secrets ever committed. |
| **CI** | 14 | Fast, parallelized tests; build + Trivy gate; images tagged by SHA in GHCR. |
| **AWS design (diagram + SG matrix)** | 14 | Correct tiers/AZs; SG-to-SG references justified; least privilege reasoned. |
| **Terraform (IaC)** | 16 | Clean modules, remote locking state, plan matches design, no hard-coded secrets. |
| **S3 / storage** | 8 | Private bucket, presigned downloads work, role-based access, versioning considered. |
| **Kubernetes** | 16 | Probes wired correctly, config/secrets split, PVC DB, Ingress, kustomize overlays. |
| **CD + backups + rollback** | 12 | Automated deploy + smoke test + auto-rollback; restore demonstrated. |
| **Total** | **100** | |

**Deductions (any phase):** a committed secret/state file, a publicly-reachable data
tier, `s3:*`/`*` IAM policies, long-lived access keys, or using Amazon EKS (breaks the
$0 rule) each lose marks — the whole point is doing it *safely* and *cheaply*.

---

## Stretch goals (bonus)
- **Helm** chart as an alternative to raw kustomize.
- **Ingress + TLS** (cert-manager locally; ACM in the cloud design).
- **HorizontalPodAutoscaler** driven by CPU or a custom/queue-depth metric.
- **Canary or blue-green** deployment strategy in CD.
- **Service mesh** (Linkerd/Istio) for mTLS + traffic shaping.
- **Observability** — Prometheus + Grafana + alerts (see [`monitoring/HINTS.md`](monitoring/HINTS.md)).
- **Rewrite one service** in another language (Go/Python/Rust), keeping the same
  health endpoints, owned DB, and event contracts.

---

## Where to get unstuck
Start at [`docs/HINTS.md`](docs/HINTS.md) — it indexes every hint doc. Remember:
hints are **questions, constraints, and acceptance criteria**. If you find yourself
wanting the exact command, re-read the acceptance criteria and the linked official
docs — the answer is something you construct, and that construction is the grade.
