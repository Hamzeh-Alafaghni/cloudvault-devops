# 🧩 Kubernetes — Hints (your graded work)

> **Golden rule:** every file under `k8s/` is a comment-only stub. You write the
> manifests. Do not look for finished YAML in this repo — there isn't any.

## Target platform (cost = $0)
Run on a **local** cluster: **kind** or **k3d**. **Do not use Amazon EKS** — its
control plane is not free. LocalStack stands in for S3.

## What must exist (requirements)
For **each** of the 7 services:
- [ ] A **Deployment** (correct image from GHCR, env from ConfigMap/Secret).
- [ ] A **Service** for anything with inbound traffic (the `thumbnail-worker` has
      none — it's an event consumer).
- [ ] A **liveness** probe wired to `GET /healthz` and a **readiness** probe wired
      to `GET /readyz`. Understand why they differ and what each controls.
- [ ] Sensible resource **requests/limits**.

Platform pieces:
- [ ] **ConfigMap** for non-secret config; **Secret** for JWT secret + DB passwords.
- [ ] A **PVC-backed database** (Postgres) with durable storage.
- [ ] **Redis** for the event stream.
- [ ] An **Ingress** exposing **only** the gateway (your local mirror of the cloud
      load balancer).
- [ ] A **CronJob** that runs your backup (`scripts/backup.sh`) on a schedule.
- [ ] **base/** + **overlays/** (kustomize) so `dev` and `prod` differ without
      copy-paste.

## Definition of done
- `kubectl apply -k k8s/overlays/dev` brings the whole app up on kind/k3d.
- Pods pass readiness before receiving traffic; a failing dependency flips `/readyz`.
- The app works end-to-end through the Ingress (register → upload → thumbnail →
  notification → download).
- Secrets are not committed; they are injected at deploy time.
- The backup CronJob produces a timestamped object you can restore from.

## Stretch goals (see CHALLENGE.md)
Helm chart · Ingress + TLS · HorizontalPodAutoscaler · canary / blue-green rollout
· a service mesh · Prometheus/Grafana observability (see `monitoring/`).

## Fair-game references
- Kubernetes docs: <https://kubernetes.io/docs/home/>
- Probes: <https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/>
- Kustomize: <https://kubectl.docs.kubernetes.io/references/kustomize/>
- kind: <https://kind.sigs.k8s.io/> · k3d: <https://k3d.io/>
