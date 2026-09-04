# =============================================================================
# upload-service — DELIBERATELY NAIVE image (works, not production-grade).
# See services/auth-service/Dockerfile for the full hardening checklist.
# TODO (student): multi-stage, non-root, slim base, pinned digest, npm ci.
# =============================================================================
FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
