## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Deploy

After any change that touches built output (pages, components, content, CSS), ALWAYS build **and deploy** before considering the task done. A successful local build is not done — the site is live on the server, so changes are only real once they're on it.

```
npm run build          # writes dist/ (also fetches repos.json)
./deploy.sh            # rsyncs dist/ → ubuntu@124.220.7.175:/opt/fd/web, reloads nginx
```

- SSH key configured → `./deploy.sh`
- password auth → `SSH_PASSWORD=… ./deploy.sh`
- Never skip deploy. If deploy fails, that's a blocker — report it, don't silently leave the change local-only.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
