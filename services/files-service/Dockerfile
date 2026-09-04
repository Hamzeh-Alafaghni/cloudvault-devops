# =============================================================================
# files-service — DELIBERATELY NAIVE image (works, not production-grade).
# See services/auth-service/Dockerfile for the full hardening checklist —
# TODO (student): apply the same hardening here (multi-stage, non-root, slim
# base, pinned digest, npm ci --omit=dev, tighter .dockerignore).
# =============================================================================
FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
