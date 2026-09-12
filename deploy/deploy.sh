#!/usr/bin/env bash
set -euo pipefail

REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_PATH"

ENV_FILE="$REPO_PATH/deploy/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] missing $ENV_FILE (copy deploy/.env.production.example and fill it in)" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for v in DATABASE_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET DOMAIN_API DOMAIN_WEB DOMAIN_BUILDER; do
  if [[ -z "${!v:-}" || "${!v}" == *change-me* ]]; then
    echo "[deploy] $v must be set to a real value in $ENV_FILE (not a change-me placeholder)" >&2
    exit 1
  fi
done

API_PORT="${API_PORT:-4000}"
WEB_PORT="${WEB_PORT:-3000}"

echo "[deploy] installing workspace dependencies"
pnpm install --frozen-lockfile

echo "[deploy] building web (bakes NEXT_PUBLIC_API_BASE_URL + NEXT_PUBLIC_FILE_BASE_URL)"
if [[ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ]]; then
  echo "[deploy] NEXT_PUBLIC_API_BASE_URL must be set for the web build" >&2
  exit 1
fi
NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
NEXT_PUBLIC_FILE_BASE_URL="$NEXT_PUBLIC_FILE_BASE_URL" \
pnpm --filter verifiedprops-public-app build

echo "[deploy] building builder (SPA static output)"
pnpm --filter verifiedprops-builder-app build

echo "[deploy] building api (prisma generate + nest build)"
pnpm --filter verifiedprops-api build

echo "[deploy] applying database migrations (prisma migrate deploy)"
(
  cd apps/api
  node_modules/.bin/prisma migrate deploy
)

echo "[deploy] ensuring uploads directory exists"
mkdir -p "$REPO_PATH/apps/api/uploads"

echo "[deploy] (re)starting pm2 processes"
mkdir -p "$REPO_PATH/logs"
REPO_PATH="$REPO_PATH" API_PORT="$API_PORT" WEB_PORT="$WEB_PORT" \
  pm2 startOrReload "$REPO_PATH/deploy/ecosystem.config.js" \
  --update-env
pm2 save

echo "[deploy] rendering nginx server blocks"
TMP_NGINX="$(mktemp)"
sed -e "s|__REPO_PATH__|$REPO_PATH|g" \
    -e "s|__API_PORT__|$API_PORT|g" \
    -e "s|__WEB_PORT__|$WEB_PORT|g" \
    -e "s|__DOMAIN_API__|$DOMAIN_API|g" \
    -e "s|__DOMAIN_WEB__|$DOMAIN_WEB|g" \
    -e "s|__DOMAIN_BUILDER__|$DOMAIN_BUILDER|g" \
    "$REPO_PATH/deploy/nginx.conf.template" > "$TMP_NGINX"

echo "[deploy] installing nginx config (requires sudo)"
sudo cp "$TMP_NGINX" /etc/nginx/sites-available/verifiedprops
sudo ln -sf /etc/nginx/sites-available/verifiedprops /etc/nginx/sites-enabled/verifiedprops
rm -f "$TMP_NGINX"

sudo nginx -t
sudo systemctl reload nginx

echo "[deploy] done — api http://127.0.0.1:$API_PORT/v1/health, web :$WEB_PORT, builder static"