# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Stage 2: Runner
FROM node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
USER node
COPY --from=builder --chown=node:node /app ./
EXPOSE 3005
CMD ["npm", "start"]
