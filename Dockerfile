# fd-official-web runtime image — multi-stage: build the Astro site inside the
# image, then package only dist/ into nginx. No host paths involved (the Jenkins
# agent is containerized, so volume-mount builds see an empty dir).
# Data freshness: the build fetches repos anonymously; the indicator export uses
# the /mcp bearer passed as a BuildKit secret (fd_indicators_token) — without it
# the committed snapshots are kept, so the image always builds.
# Requires DOCKER_BUILDKIT=1 (secret mounts; docker >= 18.09).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com
COPY . .
RUN --mount=type=secret,id=fd_indicators_token \
    FD_INDICATORS_MCP_TOKEN="$(cat /run/secrets/fd_indicators_token 2>/dev/null || true)" \
    npm run build

FROM nginx:1.29-alpine
COPY deploy/docker/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
