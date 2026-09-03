# syntax=docker/dockerfile:1
#
# Build context is the MONOREPO ROOT (not apps/web) — see apps/api/Dockerfile
# for why. Build with:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_FILE_BASE_URL=https://api.example.com/uploads \
#     -t verifiedprops-web .
#
# NOTE: NEXT_PUBLIC_* vars are baked into the client bundle at build time,
# not read at container start. Rebuild the image if this value changes.

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
# build
# ---------------------------------------------------------------------------
FROM deps AS build
ARG NEXT_PUBLIC_FILE_BASE_URL=http://localhost:4000/uploads
ENV NEXT_PUBLIC_FILE_BASE_URL=${NEXT_PUBLIC_FILE_BASE_URL}
COPY . .
RUN pnpm --filter verifiedprops-public-app build
RUN pnpm --filter verifiedprops-public-app deploy --prod /prod/web

# ---------------------------------------------------------------------------
# runtime (straightforward build+start; see repo notes on `output: "standalone"`)
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=build /prod/web/package.json ./package.json
COPY --from=build /prod/web/node_modules ./node_modules
COPY --from=build /prod/web/.next ./.next
COPY --from=build /prod/web/public ./public
COPY --from=build /prod/web/next.config.ts ./next.config.ts

RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
