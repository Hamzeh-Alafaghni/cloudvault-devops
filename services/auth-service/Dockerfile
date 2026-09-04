# =============================================================================
# auth-service — DELIBERATELY NAIVE image (it works, but it is not production-grade)
# =============================================================================
# This builds and runs. Making it *good* is your graded work. Do NOT look for a
# hardened Dockerfile elsewhere in the repo — there isn't one on purpose.
#
# TODO (student): harden this image. Acceptance criteria in k8s/HINTS.md, but at
# minimum address every point below:
#   - [ ] Multi-stage build: builder installs deps, final stage copies only what runs.
#   - [ ] Smaller base: node:20-slim or a distroless/runtime image.
#   - [ ] Pin the base by digest (FROM node:20@sha256:...) for reproducibility.
#   - [ ] Run as non-root (add `USER node`, ensure file ownership is correct).
#   - [ ] Prod-only, reproducible install (`npm ci --omit=dev`) with a committed lockfile.
#   - [ ] Improve .dockerignore so build context stays small.
#   - Done when: `docker scout` / `trivy image` shows no HIGH/CRITICAL you introduced,
#     the image runs as UID != 0, and final image size is a fraction of this one.
# -----------------------------------------------------------------------------
FROM node:20

WORKDIR /app

# Naive: copies package.json and installs ALL deps (incl. dev) as root.
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Naive: no init process, no signal handling tuning, runs as root.
CMD ["npm", "start"]
