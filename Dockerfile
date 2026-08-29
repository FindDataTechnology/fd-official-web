# fd-official-web runtime image.
# The Astro build runs in CI (needs GITHUB_TOKEN for org repo/README data and
# is unreliable from inside China) — only the resulting dist/ is packaged here.
FROM nginx:1.29-alpine
COPY deploy/docker/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
