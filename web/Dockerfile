# =============================================================================
# web (React + Vite) — DELIBERATELY NAIVE image running the Vite DEV server.
# It works and hot-reloads, but it is NOT how you ship a frontend.
#
# TODO (student): this is prime hardening/optimization territory.
#   - [ ] Multi-stage build: `vite build` in a builder stage, then serve the
#         static `dist/` from a tiny web server (nginx:alpine or similar).
#   - [ ] Do not ship the dev server or node_modules to production.
#   - [ ] Non-root, pinned base, .dockerignore.
#   - Done when: the final image serves prebuilt static assets and is a fraction
#     of this image's size.
# =============================================================================
FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
