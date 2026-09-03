# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (not apps/admin) — see
# apps/api/Dockerfile for why. Build with:
#   docker build -f apps/admin/Dockerfile -t verifiedprops-admin .

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------------------------------------------------------------------------
# deps
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/builder/package.json apps/builder/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/constants/package.json packages/constants/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# build: vite build -> apps/admin/dist
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm --filter verifiedprops-admin-app build

# ---------------------------------------------------------------------------
# runtime: static dist/ served by nginx, with SPA history-fallback so
# react-router-dom v7 client-side routes resolve on refresh/deep link.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 5174
