#!/usr/bin/env bash
# =========================================================
# PropertiesWale production setup — nginx + PM2 + build, one file.
#
# Env files (one per app, git-ignored, must exist on the server):
#   apps/api/.env.production      API runtime + prisma migrate/seed
#   apps/web/.env.production      Next.js build + runtime
#   apps/builder/.env.production  Vite build
#
# First-time order on a fresh server:
#   ./deploy/setup-production.sh db       # create Postgres user + database
#   ./deploy/setup-production.sh deploy   # install, build, migrate, start PM2
#   ./deploy/setup-production.sh seed     # admin user + base data (once)
#   ./deploy/setup-production.sh nginx    # reverse proxy (HTTP)
#   ./deploy/setup-production.sh ssl      # Let's Encrypt certs + HTTPS redirect
#   ./deploy/setup-production.sh startup  # PM2 auto-start on reboot
#
# Every release after that:
#   git pull && ./deploy/setup-production.sh deploy
# =========================================================
set -euo pipefail

DOMAIN_WEB="propertieswale.in"
DOMAIN_WWW="www.propertieswale.in"
DOMAIN_BUILDER="builder.propertieswale.in"
DOMAIN_API="api.propertieswale.in"
API_PORT="4000"
WEB_PORT="3000"
SSL_EMAIL="parmarravi1162@gmail.com"   # Let's Encrypt expiry notices
NGINX_SITE="propertieswale"
PM2_API="verifiedprops-api"            # same names as deploy/ecosystem.config.js,
PM2_WEB="verifiedprops-web"            # so the two setups never run side by side

REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$REPO_PATH/apps/api"
WEB_DIR="$REPO_PATH/apps/web"
BUILDER_DIR="$REPO_PATH/apps/builder"
API_ENV="$API_DIR/.env.production"
WEB_ENV="$WEB_DIR/.env.production"
BUILDER_ENV="$BUILDER_DIR/.env.production"

log() { echo -e "\n[setup] $*"; }
die() { echo "[setup] ERROR: $*" >&2; exit 1; }

check_env_files() {
  for f in "$API_ENV" "$WEB_ENV" "$BUILDER_ENV"; do
    [[ -f "$f" ]] || die "missing $f"
  done
  grep -q 'change-me' "$API_ENV" && echo "[setup] WARNING: $API_ENV still has change-me values (SMTP?)"
  return 0
}

check_node() {
  command -v node >/dev/null || die "node not installed"
  command -v pnpm >/dev/null || die "pnpm not installed (npm i -g pnpm)"
  command -v pm2  >/dev/null || die "pm2 not installed (npm i -g pm2)"
  local major minor
  IFS=. read -r major minor _ <<<"$(node -v | tr -d v)"
  # --env-file needs Node >= 20.6
  if (( major < 20 || (major == 20 && minor < 6) )); then
    die "Node $(node -v) is too old; need >= 20.6 (Node 22 LTS recommended)"
  fi
}

# Export API env into this shell (for prisma CLI / seed, which read process.env)
load_api_env() { set -a; # shellcheck disable=SC1090
  source "$API_ENV"; set +a; }

pm2_up() { # name, script, then pm2 start args
  local name="$1" script="$2"; shift 2
  if pm2 describe "$name" >/dev/null 2>&1; then
    pm2 delete "$name"   # recreate so changed args/env-file are picked up
  fi
  # --name must come before the args: anything after "--" goes to the app, not pm2
  pm2 start "$script" --name "$name" "$@"
}

# ---------------------------------------------------------
cmd_db() {
  load_api_env
  [[ "$DATABASE_URL" =~ ^postgresql://([^:]+):([^@]+)@[^/]+/([^?]+) ]] \
    || die "cannot parse DATABASE_URL"
  local u="${BASH_REMATCH[1]}" p="${BASH_REMATCH[2]}" d="${BASH_REMATCH[3]}"
  log "creating Postgres role '$u' and database '$d' (idempotent)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$u') THEN
    CREATE ROLE "$u" LOGIN PASSWORD '$p';
  ELSE
    ALTER ROLE "$u" WITH LOGIN PASSWORD '$p';
  END IF;
END \$\$;
SQL
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$d'" | grep -q 1; then
    sudo -u postgres createdb -O "$u" "$d"
  fi
  log "db ready"
}

cmd_deploy() {
  check_env_files
  check_node
  cd "$REPO_PATH"

  log "installing dependencies"
  pnpm install --frozen-lockfile

  log "building api"
  pnpm --filter verifiedprops-api build

  log "building web (reads apps/web/.env.production)"
  pnpm --filter verifiedprops-public-app build

  log "building builder (reads apps/builder/.env.production)"
  pnpm --filter verifiedprops-builder-app build

  log "applying database migrations"
  ( load_api_env; cd "$API_DIR"; pnpm exec prisma migrate deploy )

  mkdir -p "$API_DIR/uploads" "$REPO_PATH/logs"

  log "starting PM2 processes"
  pm2_up "$PM2_API" "$API_DIR/dist/main.js" \
    --cwd "$API_DIR" \
    --node-args="--env-file=$API_ENV" \
    --max-memory-restart 600M --kill-timeout 30000 \
    -o "$REPO_PATH/logs/api.out.log" -e "$REPO_PATH/logs/api.err.log" --merge-logs

  # next start loads apps/web/.env.production by itself
  pm2_up "$PM2_WEB" "$WEB_DIR/node_modules/next/dist/bin/next" \
    --cwd "$WEB_DIR" \
    --max-memory-restart 600M --kill-timeout 10000 \
    -o "$REPO_PATH/logs/web.out.log" -e "$REPO_PATH/logs/web.err.log" --merge-logs \
    -- start -H 127.0.0.1 -p "$WEB_PORT"

  pm2 save

  log "health check"
  sleep 5
  curl -fsS "http://127.0.0.1:$API_PORT/v1/health" && echo || echo "[setup] WARNING: API health check failed — pm2 logs $PM2_API"
  curl -fsS -o /dev/null -w "web HTTP %{http_code}\n" "http://127.0.0.1:$WEB_PORT/" || echo "[setup] WARNING: web not responding — pm2 logs $PM2_WEB"
}

cmd_seed() {
  check_env_files
  log "seeding admin user + base data (safe to re-run; existing admin password is NOT changed)"
  ( load_api_env; cd "$API_DIR"; pnpm exec ts-node prisma/seed.ts )
}

cmd_nginx() {
  local conf="/etc/nginx/sites-available/$NGINX_SITE"
  if sudo test -f "$conf" && sudo grep -q "managed by Certbot" "$conf" && [[ "${FORCE:-0}" != 1 ]]; then
    die "$conf already has Certbot SSL edits; re-run with FORCE=1 to overwrite (then run 'ssl' again)"
  fi
  log "writing $conf"
  sudo tee "$conf" >/dev/null <<NGINX
# ---------- www -> apex ----------
server {
  listen 80;
  server_name $DOMAIN_WWW;
  # inside location (not server-level) so certbot's ACME challenge still works
  location / { return 301 https://$DOMAIN_WEB\$request_uri; }
}

# ---------- public website (Next.js) ----------
server {
  listen 80;
  server_name $DOMAIN_WEB;

  location /_next/static/ {
    proxy_pass http://127.0.0.1:$WEB_PORT;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
  }

  location / {
    proxy_pass http://127.0.0.1:$WEB_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}

# ---------- API (NestJS) ----------
server {
  listen 80;
  server_name $DOMAIN_API;
  client_max_body_size 20m;

  location ^~ /uploads/ {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_set_header Host \$host;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
  }

  location / {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}

# ---------- builder portal (static Vite build) ----------
server {
  listen 80;
  server_name $DOMAIN_BUILDER;
  root $BUILDER_DIR/dist;
  index index.html;
  client_max_body_size 20m;

  # ^~ so these win over the static-asset regex below
  location ^~ /v1/ {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location ^~ /uploads/ {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_set_header Host \$host;
  }

  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  location ~* \.(?:js|css|woff2?|ttf|svg|png|jpg|jpeg|gif|ico|webp)$ {
    try_files \$uri =404;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
NGINX
  sudo ln -sf "$conf" "/etc/nginx/sites-enabled/$NGINX_SITE"
  # nginx (www-data) must be able to read the builder dist folder
  log "checking nginx can read $BUILDER_DIR/dist"
  sudo -u www-data test -r "$BUILDER_DIR/dist/index.html" \
    || echo "[setup] WARNING: www-data cannot read $BUILDER_DIR/dist/index.html (run 'deploy' first, or fix home-dir permissions: chmod o+x on each parent dir)"
  sudo nginx -t
  sudo systemctl reload nginx
  log "nginx ready (HTTP). Next: ./deploy/setup-production.sh ssl"
}

cmd_ssl() {
  command -v certbot >/dev/null || die "certbot missing: sudo apt install -y certbot python3-certbot-nginx"
  local args=()
  for d in "$DOMAIN_WEB" "$DOMAIN_WWW" "$DOMAIN_BUILDER" "$DOMAIN_API"; do
    if getent ahostsv4 "$d" >/dev/null; then args+=(-d "$d"); else echo "[setup] skipping $d (no DNS A record)"; fi
  done
  (( ${#args[@]} )) || die "no domains resolve"
  sudo certbot --nginx "${args[@]}" --redirect --agree-tos -m "$SSL_EMAIL" --non-interactive
  sudo nginx -t && sudo systemctl reload nginx
  log "HTTPS enabled; auto-renew is handled by certbot's systemd timer (check: systemctl list-timers | grep certbot)"
}

cmd_startup() {
  log "registering PM2 to start on boot"
  sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"
  pm2 save
}

case "${1:-}" in
  db)      cmd_db ;;
  deploy)  cmd_deploy ;;
  seed)    cmd_seed ;;
  nginx)   cmd_nginx ;;
  ssl)     cmd_ssl ;;
  startup) cmd_startup ;;
  *) sed -n '2,21p' "$0"; exit 1 ;;
esac
