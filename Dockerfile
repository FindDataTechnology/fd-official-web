# fd-official-web runtime image — multi-stage: build the Astro site inside the
# image, then package only dist/ into nginx. No host paths involved (the Jenkins
# agent is containerized, so volume-mount builds see an empty dir).
# Data freshness: the build fetches each repo's README from the GitHub API; it
# MUST authenticate (fd_github_token) — anonymous calls hit the shared
# 60-req/hour IP quota and the build aborts with "majority missing" (2026-11-28:
# 48/73 repos 403'd and the site image stopped publishing). The indicator export
# uses the /mcp bearer (fd_indicators_token). Each secret is optional: without it
# that step falls back to the committed snapshot, so the image still builds.
# Requires DOCKER_BUILDKIT=1 (secret mounts; docker >= 18.09).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com
COPY . .
# Content source (xingyan-claim-layer D4): the build reads the published
# collections straight from the CMS, so publishing in the admin is enough to
# ship content — no md copying step. STRAPI_URL is a plain base address (not a
# secret); the read token is, and rides a BuildKit secret so it never lands in
# an image layer. When STRAPI_URL is unset, fetch-strapi keeps the committed
# snapshot and records that choice in the content manifest — a detectable
# fallback, never a silent one.
ARG STRAPI_URL=""
RUN --mount=type=secret,id=fd_indicators_token \
    --mount=type=secret,id=fd_strapi_token \
    --mount=type=secret,id=fd_github_token \
    FD_INDICATORS_MCP_TOKEN="$(cat /run/secrets/fd_indicators_token 2>/dev/null || true)" \
    STRAPI_URL="$STRAPI_URL" \
    STRAPI_READ_TOKEN="$(cat /run/secrets/fd_strapi_token 2>/dev/null || true)" \
    GITHUB_TOKEN="$(cat /run/secrets/fd_github_token 2>/dev/null || true)" \
    npm run build

FROM nginx:1.29-alpine
COPY deploy/docker/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
