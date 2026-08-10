// Build-time fetch of org repos from the GitHub API.
// Falls back to an empty list + warning if the API is unreachable, so the
// build still ships (spec: repo-showcase → "Build resilience").
import { mkdir, writeFile } from 'node:fs/promises';

const ORG = 'FindDataTechnology';
const FEATURED = ['fd-open-data-mcp', 'fd-open-data-protocol'];
const OUT = new URL('../src/data/repos.json', import.meta.url);

try {
  const res = await fetch(
    `https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=updated`,
    { headers: { Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const repos = (await res.json()).map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    updated: String(r.updated_at ?? '').slice(0, 10),
    url: r.html_url,
  }));
  // Featured first (in FEATURED order), then by stars desc.
  repos.sort((a, b) => {
    const ra = FEATURED.indexOf(a.name);
    const rb = FEATURED.indexOf(b.name);
    return (ra === -1 ? Infinity : ra) - (rb === -1 ? Infinity : rb) || b.stars - a.stars;
  });
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(repos, null, 2));
  console.log(`[repos] fetched ${repos.length} repos → src/data/repos.json`);
} catch (err) {
  console.warn(`[repos] fetch failed (${err.message}); writing empty grid`);
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify([]));
}
