// Build-time fetch of org repos + each repo's README from the GitHub API.
// - src/data/repos.json: repo metadata for the /repos grid (committed as a
//   resilient offline fallback).
// - src/content/repos/{name}.md: each repo's README as a content-collection
//   entry, rendered on /repos/{name}. Gitignored — regenerated every build so
//   the site stays in sync with GitHub. Relative links/images are rewritten to
//   absolute github.com / raw.githubusercontent.com URLs so they resolve off-GitHub.
// Falls back gracefully (empty grid, no README pages) if the API is unreachable.
import { mkdir, writeFile, rm } from 'node:fs/promises';

const ORG = 'FindDataTechnology';
const FEATURED = ['fd-open-data-mcp', 'fd-open-data-protocol'];
const REPOS_OUT = new URL('../src/data/repos.json', import.meta.url);
const README_DIR = new URL('../src/content/repos/', import.meta.url);

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
  const list = await fetchJson(
    `https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=updated`,
  );
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
  await mkdir(new URL('./', REPOS_OUT), { recursive: true });
  await writeFile(REPOS_OUT, JSON.stringify(repos, null, 2));
  console.log(
    `[repos] fetched ${repos.length} repos, ${repos.filter((r) => r.hasReadme).length} READMEs`,
  );
} catch (err) {
  console.warn(`[repos] fetch failed (${err.message}); writing empty grid`);
  await mkdir(new URL('./', REPOS_OUT), { recursive: true });
  await writeFile(REPOS_OUT, JSON.stringify([]));
}
