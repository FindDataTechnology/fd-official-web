#!/usr/bin/env bash
# Domestic image build for fd-official-web (cheap-1, docker only).
# Builds the full site inside Docker (Dockerfile.build), pushes to the
# domestic registry, and prints the manifest line to bump in deploy/k8s/fd-web.yaml.
#
# Env (read from /opt/fd/fd-web-build.env if present, chmod 600):
#   GITHUB_TOKEN              optional — lifts the anonymous 60/h GitHub cap
#   FD_INDICATORS_MCP_TOKEN   MCP bearer for the indicator export
#   FD_INDICATORS_MCP_URL     default https://www.finddatatech.cloud/mcp
#   REGISTRY                  default harbor.finddatatech.cloud:8080
#   REPO                      default fd-official-web
#   CLONE_URL                 default https://github.com/FindDataTechnology/fd-official-web.git
set -euo pipefail

REGISTRY="${REGISTRY:-harbor.finddatatech.cloud:8080}"
IMAGE="${REGISTRY}/fd-web/official-web"
CLONE_URL="${CLONE_URL:-https://github.com/FindDataTechnology/fd-official-web.git}"
WORK="${WORK:-/opt/fd/build/fd-official-web}"
ENVF="${ENVF:-/opt/fd/fd-web-build.env}"

[ -f "$ENVF" ] && . "$ENVF"

if [ ! -d "$WORK/.git" ]; then
  git clone "$CLONE_URL" "$WORK"
else
  git -C "$WORK" fetch origin main
  git -C "$WORK" reset --hard origin/main
fi

SHA="$(git -C "$WORK" rev-parse --short=8 HEAD)"
TAG="${SHA}-$(date -u +%Y%m%d%H%M)"

docker build -f "$WORK/Dockerfile.build" \
  ${GITHUB_TOKEN:+--build-arg GITHUB_TOKEN="$GITHUB_TOKEN"} \
  ${FD_INDICATORS_MCP_TOKEN:+--build-arg FD_INDICATORS_MCP_TOKEN="$FD_INDICATORS_MCP_TOKEN"} \
  ${FD_INDICATORS_MCP_URL:+--build-arg FD_INDICATORS_MCP_URL="$FD_INDICATORS_MCP_URL"} \
  -t "${IMAGE}:${TAG}" "$WORK"

docker push "${IMAGE}:${TAG}"
echo
echo "ROLLED: bump deploy/k8s/fd-web.yaml image to:"
echo "        ${IMAGE}:${TAG}"
