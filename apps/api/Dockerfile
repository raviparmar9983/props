# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (not apps/api), because the API's
# package.json references workspace packages (packages/*) via "workspace:*".
# Build with:  docker build -f apps/api/Dockerfile -t verifiedprops-api .

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------------------------------------------------------------------------
# deps: install the full workspace (incl. devDependencies) so the build stage
# has tsc/nest-cli/prisma CLI available.
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
# build: generate the Prisma client, compile Nest to dist/, then produce a
# self-contained, production-only deployment directory via `pnpm deploy`
# (resolves workspace:* deps to real files instead of symlinks).
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN pnpm --filter verifiedprops-api build
RUN pnpm --filter verifiedprops-api deploy --prod /prod/api
# `pnpm deploy` builds a brand-new node_modules tree for /prod/api, separate
# from the one `prisma generate` (above) wrote into. The generated client is
# not a tracked package file, so pnpm has no way to know to copy it across —
# without this, @prisma/client's default.js fails at runtime with
# "Cannot find module '.prisma/client/default'". Regenerating in place fixes
# it up for the tree that will actually ship.
RUN cd /prod/api && node_modules/.bin/prisma generate

# ---------------------------------------------------------------------------
# runtime: slim image with only what's needed to run the compiled server.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=build /prod/api/package.json ./package.json
COPY --from=build /prod/api/node_modules ./node_modules
COPY --from=build /prod/api/dist ./dist
COPY --from=build /prod/api/prisma ./prisma
COPY --from=build /prod/api/prisma.config.ts ./prisma.config.ts
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && mkdir -p /app/uploads \
  && chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
