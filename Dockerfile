# fd-official-web runtime image — multi-stage: build the Astro site inside the
# image, then package only dist/ into nginx. No host paths involved (the Jenkins
# agent is containerized, so volume-mount builds see an empty dir).
# Data fetches degrade to the committed snapshots when tokens are absent
# (repos:fetch anonymous GitHub; indicators:fetch keeps src/data/indicators.json).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY deploy/docker/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
