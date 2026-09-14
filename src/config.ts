// Public display settings for the FindDataTechnology site.
// SECRET-FREE: the bearer token + backend URL live in .env / server/demo-proxy.mjs
// (static build → anything imported here ships to the browser; token-never-exposed).
// keep ORG + FEATURED in sync with scripts/fetch-repos.mjs (build script can't import .ts)
export const site = {
  org: 'FindDataTechnology',
  github: 'https://github.com/FindDataTechnology',
  flagship: 'fd-open-data-mcp',
  featured: ['fd-open-data-mcp', 'fd-open-data-protocol'],
  demo: {
    pageUrl: '/demo',
    mcpEndpoint: 'https://www.finddatatech.cloud/mcp',
  },
  // Self-hosted LibreChat deployment these MCP servers are wired into
  // (deploy/k8s/librechat.yaml). Cards for these projects get a chat button.
  // fd-find-data-business-mcp is NOT here yet: it needs per-user ES384 JWTs
  // from auth.finddatatech.cloud; a static bearer 401s (see librechat.yaml).
  chat: {
    url: 'https://chat.finddatatech.cloud',
    projects: ['fd-open-data-mcp', 'fd-cn-report', 'fd-daas-mcp'],
  },
} as const;
