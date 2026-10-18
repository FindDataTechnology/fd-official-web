// Build-time fetch of org repos + each repo's README from the GitHub API.
// - src/data/repos.json: repo metadata for the /repos grid (committed as a
//   resilient offline fallback).
// - src/content/repos/{name}.md: each repo's README as a content-collection
//   entry, rendered on /repos/{name}. Gitignored — regenerated every build so
//   the site stays in sync with GitHub. Relative links/images are rewritten to
//   absolute github.com / raw.githubusercontent.com URLs so they resolve off-GitHub.
// Falls back gracefully (last-good snapshot, no README rewrite) if the API is
// unreachable: a failed build never blanks the committed fallback data.
import { mkdir, writeFile, rm, access } from 'node:fs/promises';

const ORG = 'FindDataTechnology';
const FEATURED = ['fd-open-data-mcp', 'fd-open-data-protocol'];
const REPOS_OUT = new URL('../src/data/repos.json', import.meta.url);
const README_DIR = new URL('../src/content/repos/', import.meta.url);
const EXCLUDED_REPOS = [];

const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const rank = (name) => {
  const i = FEATURED.indexOf(name);
  return i === -1 ? Infinity : i;
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Rewrite GitHub-relative links/images to absolute URLs so they resolve on the site.
function absolutize(md, repo, branch) {
  // images: ![alt](rel) -> raw.githubusercontent.com
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
    if (/^(https?:|mailto:|#|data:)/i.test(url)) return m;
    const p = url.replace(/^[./]+/, '');
    return `![${alt}](https://raw.githubusercontent.com/${ORG}/${repo}/${branch}/${p})`;
  });
  // links: [text](rel) (not images) -> github.com/blob
  md = md.replace(/(?<!!)\[([^\]]*)\]\(([^)]+)\)/g, (m, text, url) => {
    if (/^(https?:|mailto:|#)/i.test(url)) return m;
    const p = url.replace(/^[./]+/, '');
    return `[${text}](https://github.com/${ORG}/${repo}/blob/${branch}/${p})`;
  });
  return md;
}

try {
  const all = await fetchJson(
    `https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=updated`,
  );
  // Public only — an authenticated build token can see private repos; the
  // public grid and feed must never include them (or their commit activity).
  const list = all.filter((r) => !r.private);
  if (!list.length) throw new Error('no public repos returned');
  await rm(README_DIR, { recursive: true, force: true });
  await mkdir(README_DIR, { recursive: true });

  const repos = [];
  for (const r of list) {
    const repo = {
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      updated: String(r.updated_at ?? '').slice(0, 10),
      url: r.html_url,
      hasReadme: false,
    };
    try {
      const rc = await fetchJson(`https://api.github.com/repos/${ORG}/${r.name}/readme`);
      const md = Buffer.from(rc.content, 'base64').toString('utf8');
      const branch = r.default_branch || 'main';
      const body = absolutize(md, r.name, branch);
      const fm = [
        '---',
        `title: ${JSON.stringify(r.name)}`,
        `repo: ${JSON.stringify(r.name)}`,
        `url: ${JSON.stringify(r.html_url)}`,
        `description: ${JSON.stringify(r.description ?? '')}`,
        `language: ${JSON.stringify(r.language ?? '')}`,
        `stars: ${r.stargazers_count ?? 0}`,
        `updated: ${JSON.stringify(repo.updated)}`,
        `order: ${rank(r.name) === Infinity ? 100 : rank(r.name)}`,
        '---',
        '',
        body,
        '',
      ].join('\n');
      await writeFile(new URL(`${r.name}.md`, README_DIR), fm);
      repo.hasReadme = true;
    } catch (e) {
      console.warn(`[repos] README fetch failed for ${r.name}: ${e.message}`);
    }
    repos.push(repo);
  }

  repos.sort((a, b) => rank(a.name) - rank(b.name) || b.stars - a.stars);
  const failed = repos.filter((r) => !r.hasReadme);
  const got = repos.length - failed.length;

  // Widespread failure is a broken build, not a degraded one (repos-fetch-
  // resilience). A few repos without a README is the documented degradation —
  // they render in the grid without a detail page. But when a majority is
  // missing, the site would ship with most of its repo detail pages gone while
  // every earlier step reported success (real incident 2026-10-18: 12 of 17
  // 403'd, build exit 0, deployed). Write nothing and fail instead.
  if (repos.length > 0 && failed.length > repos.length / 2) {
    console.error(
      `[repos] README fetch failed for ${failed.length}/${repos.length} repos ` +
        `(${got} succeeded) — majority missing, build aborted. ` +
        `Failed: ${failed.map((r) => r.name).join(', ')}. ` +
        `Check GITHUB_TOKEN validity and api.github.com/rate_limit.`,
    );
    process.exit(1);
  }

  await mkdir(new URL('./', REPOS_OUT), { recursive: true });
  await writeFile(REPOS_OUT, JSON.stringify({ generated_at: new Date().toISOString(), repos }, null, 2));
  console.log(`[repos] fetched ${repos.length} repos, ${got} READMEs (${failed.length} failed)`);

} catch (err) {
  // Never overwrite the committed fallback with emptiness — one flaky build
  // must not blank the /repos grid. Only ensure the files exist at all so a
  // first-ever build has something readable.
  console.warn(`[repos] fetch failed (${err.message}); keeping last-good data`);
  await mkdir(new URL('./', REPOS_OUT), { recursive: true });
  try {
    await access(REPOS_OUT);
  } catch {
    await writeFile(REPOS_OUT, JSON.stringify({ generated_at: new Date().toISOString(), repos: [] }));
  }
}
