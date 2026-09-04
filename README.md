# ☁️ CloudVault — DevOps Starter

CloudVault is a small-but-real **file-sharing platform**, decomposed into
microservices, built specifically to be the substrate for an advanced DevOps /
cloud-engineering assignment.

**The application is provided and works locally. The cloud & platform engineering
is your challenge.** This repo is deliberately split in two:

- ✅ **Provided & working** — the app microservices, their tests, the local dev
  setup (`docker compose`), the seed script. `docker compose up` brings the whole
  system up with **zero cloud dependencies**.
- 🧩 **Your challenge** — everything under `terraform/`, `k8s/`,
  `.github/workflows/`, `scripts/backup*`, and `monitoring/`. These are
  **scaffold + hints only**: directory structure, stubs, `# TODO`s, and `HINTS.md`
  files with guiding questions and acceptance criteria — **no solutions**.

> If you're the student: start the app, play with it, read the code, then open
> [`CHALLENGE.md`](CHALLENGE.md).

---

## Architecture

```
                                  ┌───────────────────────────── your challenge ────────────────────────────┐
                                  │  (a Load Balancer / Ingress will sit in front of the gateway in the cloud)│
                                  └──────────────────────────────────────────────────────────────────────────┘
                                                        │
        ┌─────────┐        HTTP        ┌───────────────────────────────┐
        │ browser │ ────────────────▶  │            gateway            │  single public entry point
        │  (web)  │                    │  JWT check + reverse proxy     │  /healthz /readyz
        └─────────┘                    └───────────────────────────────┘
                                          │        │        │        │
                 ┌────────────────────────┘        │        │        └───────────────────────────┐
                 ▼                                  ▼        ▼                                     ▼
        ┌────────────────┐              ┌────────────────┐  ┌────────────────┐          ┌──────────────────────┐
        │  auth-service  │              │  upload-service│  │  files-service │          │ notification-service │
        │  register/login│              │  multipart→S3  │  │  metadata CRUD │          │  GET /notifications  │
        │  issues JWTs   │              │  +event publish│  │  presigned URLs│          │  consumes events     │
        └───────┬────────┘              └───┬────────┬───┘  └───────┬────────┘          └──────────┬───────────┘
                │                           │        │              │                              │
                ▼                           │        ▼              ▼                              ▼
          ┌───────────┐                     │   ┌─────────┐   ┌───────────┐                  ┌───────────┐
          │  auth-db  │                     │   │   S3    │   │ files-db  │                  │  notifdb  │
          │ (Postgres)│                     │   │(LocalS.)│   │ (Postgres)│                  │ (Postgres)│
          └───────────┘                     │   └─────────┘   └───────────┘                  └───────────┘
                                            │        ▲
                                   file.uploaded     │  reads object, writes thumbnail
                                            ▼        │
                                   ┌──────────────────────────┐        thumbnail.created
                                   │      Redis Streams        │ ◀──────────────────────────┐
                                   │   (cloudvault:events)     │                            │
                                   └──────────────┬────────────┘                            │
                                                  │ file.uploaded                           │
                                                  ▼                                         │
                                      ┌──────────────────────────┐                          │
                                      │     thumbnail-worker      │ ─────────────────────────┘
                                      │  (no HTTP API; consumer)  │  publishes thumbnail.created
                                      └──────────────────────────┘
```

**Data flow:** `browser → gateway → services → Postgres / Redis / S3`, with the
`thumbnail-worker` consuming events **asynchronously**. That async, multi-tier,
single-public-entry-point shape is exactly what motivates the network tiers,
security groups, and load balancer you'll design in
[`docs/ARCHITECTURE_CHALLENGE.md`](docs/ARCHITECTURE_CHALLENGE.md).

### Services (all ✅ provided)
| Service | Port | Role | Health |
|---|---|---|---|
| `gateway` | 8080 | Single public entry point; validates JWT; reverse-proxies `/auth`, `/upload`, `/files`, `/notifications`. | `/healthz` `/readyz` |
| `auth-service` | 3001 | `POST /register`, `POST /login`, `GET /verify`. Owns `auth-db`. Issues JWTs. | `/healthz` `/readyz` |
| `files-service` | 3002 | File metadata CRUD; `GET /files/:id` returns a presigned S3 download URL. Owns `files-db`. | `/healthz` `/readyz` |
| `upload-service` | 3003 | `POST /upload`: streams to S3, records metadata, publishes `file.uploaded`. | `/healthz` `/readyz` |
| `thumbnail-worker` | 3005¹ | Consumes `file.uploaded`, makes a thumbnail, publishes `thumbnail.created`. No HTTP API. | `/healthz` `/readyz` |
| `notification-service` | 3004 | Consumes `file.uploaded` + `thumbnail.created`; `GET /notifications`. | `/healthz` `/readyz` |
| `web` | 5173 | React + Vite UI: register/login, upload, live file list with thumbnails, download, notifications. | — |

¹ The worker is event-driven and has no request API, but exposes a **health-only**
port so Kubernetes probes have something to hit.

---

## Run it locally (one command)

Prerequisites: **Docker** + **Docker Compose**. Nothing else — no cloud account.

```bash
make up      # builds images and starts the whole stack (copies .env.example → .env if needed)
make seed    # creates the S3 bucket + a demo user + a sample upload
```

Then open **http://localhost:5173** and log in with:

- **email:** `demo@cloudvault.dev`
- **password:** `demopassword`

Upload an image and watch the thumbnail and notifications appear (the worker
processes the `file.uploaded` event asynchronously).

Useful targets (`make help` lists all):

```bash
make logs    # tail all service logs
make test    # run every service's test suite
make ps      # container status
make down    # stop everything and remove volumes
```

Without `make`:

```bash
cp .env.example .env
docker compose up -d --build
./scripts/seed.sh
```

---

## Repo map — ✅ provided vs 🧩 your challenge

```
.
├── README.md                     ✅ this file
├── CHALLENGE.md                  ✅ the assignment: phases, Definition of Done, rubric
├── docker-compose.yml            ✅ full local stack (7 services + Postgres×2 + Redis + LocalStack)
├── Makefile                      ✅ up / down / seed / test / logs
├── .env.example                  ✅ every env var documented (copy to .env)
├── services/                     ✅ WORKING application code + tests
│   ├── gateway/                  ✅
│   ├── auth-service/             ✅
│   ├── files-service/            ✅
│   ├── upload-service/           ✅
│   ├── thumbnail-worker/         ✅
│   └── notification-service/     ✅
│       └── Dockerfile            ✅ works, but DELIBERATELY NAIVE — hardening is 🧩 yours
├── web/                          ✅ WORKING React + Vite frontend
├── scripts/
│   ├── seed.sh                   ✅ provided & working
│   ├── backup.sh                 🧩 STUB + hints (you implement)
│   └── restore.sh                🧩 STUB + hints (you implement)
├── docs/
│   ├── HINTS.md                  🧩 index of every hint doc
│   └── ARCHITECTURE_CHALLENGE.md 🧩 the AWS design problem
├── terraform/                    🧩 module skeletons + HINTS.md (no real resources)
├── k8s/                          🧩 base/ + overlays/ stubs + HINTS.md (no working YAML)
├── .github/workflows/            🧩 ci.yml + cd.yml skeletons (not runnable yet)
└── monitoring/                   🧩 HINTS.md (optional Prometheus/Grafana stretch)
```

> **The golden rule of this repo:** the `🧩` areas contain **no working
> solutions** — only stubs, `# TODO`s, and hints. That's the point: the learning
> is in building them. See [`CHALLENGE.md`](CHALLENGE.md).

---

## Tech stack (pinned for consistency)
- **Backend:** Node.js + Express (one small service each)
- **Frontend:** React + Vite
- **Databases:** PostgreSQL (**database-per-service**)
- **Broker:** Redis (**Redis Streams** with consumer groups for async events)
- **Object storage:** S3, emulated locally by **LocalStack**
- One `Dockerfile` per service · one root `docker-compose.yml` · a `Makefile`

**Stretch (mention, don't expect):** you may rewrite one service in another
language (Go, Python, Rust…) as a stretch goal — the contracts are the health
endpoints, the DB it owns, and the events it publishes/consumes.

---

## Notes & gotchas
- **Presigned URLs & LocalStack.** Downloads are signed against a *public*
  endpoint (`localhost:4566`) so your browser can use them, while services talk to
  LocalStack over the Docker network (`localstack:4566`). See `S3_ENDPOINT` vs.
  `S3_PUBLIC_ENDPOINT` in `.env.example`.
- **Schema bootstrap.** Services create their tables idempotently on startup; the
  seed script also applies the migrations in `services/*/migrations/`.
- **Cost = $0.** Everything runs locally. The cloud milestones target LocalStack +
  a local Kubernetes cluster (kind/k3d) and the AWS Free Tier. **Do not use Amazon
  EKS** — its control plane is not free.

## License
[MIT](LICENSE).
