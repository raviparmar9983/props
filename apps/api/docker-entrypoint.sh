#!/bin/sh
# Runs pending Prisma migrations against DATABASE_URL, then execs the given
# command (normally `node dist/main`). Using `exec` replaces this shell with
# the node process so it receives SIGTERM directly from `docker stop`,
# letting app.enableShutdownHooks() drain in-flight requests.
set -e

echo "[entrypoint] applying pending database migrations..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] starting API..."
exec "$@"
