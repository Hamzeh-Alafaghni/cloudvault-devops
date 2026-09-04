# =============================================================================
# thumbnail-worker — DELIBERATELY NAIVE image (works, not production-grade).
# See services/auth-service/Dockerfile for the full hardening checklist.
# TODO (student): multi-stage, non-root, slim base, pinned digest, npm ci.
# Note: image processing libs can pull native deps — mind the final image size.
# =============================================================================
FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3005
CMD ["npm", "start"]
