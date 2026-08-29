#!/usr/bin/env bash
# DEPRECATED 2026-08-29: GitOps (build-image.yml + ArgoCD) is the deploy path now.
# This rsync path is kept only as an emergency fallback while /opt/fd/web/dist exists.
# Deploy the static Astro build to the Tencent box.
#
#   npm run build            # first (also fetches repos.json)
#   SSH_PASSWORD=... ./deploy.sh     # password auth (or set up an SSH key and drop SSH_PASSWORD)
#
# Rollback: keep the previous build locally (or a dist.bak) and rsync it back.
set -euo pipefail

HOST="${FD_HOST:-124.220.7.175}"
USER="${FD_USER:-ubuntu}"
SITE_DIR=/opt/fd/web
DIST="${1:-dist}"

[ -d "$DIST" ] || { echo "run 'npm run build' first (builds $DIST)"; exit 1; }

if [ -n "${SSH_PASSWORD:-}" ]; then
  rsync -az --delete -e "sshpass -p '$SSH_PASSWORD' ssh -o StrictHostKeyChecking=no" "$DIST/" "$USER@$HOST:$SITE_DIR/"
  sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$HOST" "sudo nginx -t && sudo systemctl reload nginx"
else
  rsync -az --delete "$DIST/" "$USER@$HOST:$SITE_DIR/"
  ssh "$USER@$HOST" "sudo nginx -t && sudo systemctl reload nginx"
fi

echo "✓ deployed $DIST/ → $HOST:$SITE_DIR"
