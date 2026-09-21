#!/usr/bin/env bash
# Domestic build + deploy for fd-official-web (runs on the build box, e.g. cheap-1).
#
# Builds the full site inside node:22-alpine (the box needs only docker — no
# host Node), then rsyncs dist/ to the web box's static root, which nginx
# serves directly. Deploying is file replacement only; a failed run leaves the
# live site untouched. Rollback = re-run an older checkout or restore the
# dist.prev copy on the web box.
#
# Env (from /opt/fd/fd-web-build.env, chmod 600 — never commit):
#   FD_WEB_DEPLOY_HOST   default 124.220.7.175
#   FD_WEB_DEPLOY_USER   default ubuntu
#   FD_WEB_DEPLOY_PASS   SSH password for the deploy user
#   GITHUB_TOKEN         optional — lifts the anonymous 60/h GitHub API cap
#   FD_INDICATORS_MCP_TOKEN   MCP bearer for the indicator export
#   FD_INDICATORS_MCP_URL     default https://www.finddatatech.cloud/mcp
set -euo pipefail

CLONE_URL="${CLONE_URL:-https://github.com/FindDataTechnology/fd-official-web.git}"
WORK="${WORK:-/opt/fd/build/fd-official-web}"
ENVF="${ENVF:-/opt/fd/fd-web-build.env}"
[ -f "$ENVF" ] && . "$ENVF"
# Base image; docker.io is unreachable from the CN build box, so fall back to
# a working mirror and retag when the canonical name is missing.
NODE_IMAGE="${NODE_IMAGE:-node:22-alpine}"
NODE_MIRROR="${NODE_MIRROR:-dockerproxy.net/library/node:22-alpine}"
if ! docker image inspect "$NODE_IMAGE" >/dev/null 2>&1    && ! docker pull "$NODE_IMAGE" >/dev/null 2>&1; then
  docker pull "$NODE_MIRROR" >/dev/null
  docker tag "$NODE_MIRROR" "$NODE_IMAGE"
fi

: "${FD_WEB_DEPLOY_PASS:?FD_WEB_DEPLOY_PASS missing in $ENVF}"
DEPLOY_HOST="${FD_WEB_DEPLOY_HOST:-124.220.7.175}"
DEPLOY_USER="${FD_WEB_DEPLOY_USER:-ubuntu}"
DEPLOY_PATH="${FD_WEB_DEPLOY_PATH:-/opt/fd/web/dist}"

echo "== $(date -u +%FT%TZ) build start =="
if [ ! -d "$WORK/.git" ]; then
  git clone "$CLONE_URL" "$WORK"
else
  git -C "$WORK" fetch origin main
  git -C "$WORK" reset --hard origin/main
fi
echo "building $(git -C "$WORK" rev-parse --short=8 HEAD) @ origin/main"

docker run --rm \
  -e GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
  -e FD_INDICATORS_MCP_TOKEN="${FD_INDICATORS_MCP_TOKEN:-}" \
  -e FD_INDICATORS_MCP_URL="${FD_INDICATORS_MCP_URL:-https://www.finddatatech.cloud/mcp}" \
  -v "$WORK":/app -w /app "$NODE_IMAGE" \
  sh -c 'npm ci --no-audit --no-fund && npm run build'

echo "== deploy: rsync -> $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH =="
sshpass -p "$FD_WEB_DEPLOY_PASS" ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" \
  'rm -rf '"$(dirname "$DEPLOY_PATH")"'/dist.prev && cp -r '"$DEPLOY_PATH"' '"$(dirname "$DEPLOY_PATH")"'/dist.prev'
sshpass -p "$FD_WEB_DEPLOY_PASS" rsync -a --delete -e "ssh -o StrictHostKeyChecking=no" \
  "$WORK/dist/" "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"
echo "== $(date -u +%FT%TZ) deploy done: $(git -C "$WORK" rev-parse --short=8 HEAD) =="
