#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="/root/gastroprime"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
WEBROOT_DIR="/var/www/gastroprime"
PM2_APP="gastro-api"
BRANCH="${1:-main}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

require_clean_repo() {
  cd "$ROOT_DIR"
  if [ -n "$(git status --porcelain)" ]; then
    echo "Repository has uncommitted changes. Commit or stash them before deploy." >&2
    git status --short >&2
    exit 1
  fi
}

log "Checking repo state"
require_clean_repo

log "Syncing branch $BRANCH"
cd "$ROOT_DIR"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

log "Installing backend dependencies"
cd "$BACKEND_DIR"
npm ci

log "Building backend"
npm run build

log "Installing frontend dependencies"
cd "$FRONTEND_DIR"
npm ci

log "Building frontend"
npm run build

log "Publishing frontend to $WEBROOT_DIR"
mkdir -p "$WEBROOT_DIR"
rsync -a --delete "$FRONTEND_DIR/dist/" "$WEBROOT_DIR/"
chown -R www-data:www-data "$WEBROOT_DIR"
find "$WEBROOT_DIR" -type d -exec chmod 755 {} \;
find "$WEBROOT_DIR" -type f -exec chmod 644 {} \;

log "Restarting backend via PM2"
cd "$BACKEND_DIR"
pm2 restart "$PM2_APP"
pm2 save >/dev/null

log "Deploy completed successfully"
