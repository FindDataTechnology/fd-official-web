// Build-time fetch of org repos + each repo's README from the GitHub API.
// - src/data/repos.json: repo metadata for the /repos grid (committed as a
//   resilient offline fallback).
// - src/content/repos/{name}.md: each repo's README as a content-collection
//   entry, rendered on /repos/{name}. Gitignored — regenerated every build so
//   the site stays in sync with GitHub. Relative links/images are rewritten to
//   absolute github.com / raw.githubusercontent.com URLs so they resolve off-GitHub.
// Falls back gracefully (empty grid, no README pages) if the API is unreachable.
import { mkdir, writeFile, rm, access } from 'node:fs/promises';

const ORG = 'FindDataTechnology';
const FEATURED = ['fd-open-data-mcp', 'fd-open-data-protocol'];
const REPOS_OUT = new URL('../src/data/repos.json', import.meta.url);
const README_DIR = new URL('../src/content/repos/', import.meta.url);
const UPDATES_OUT = new URL('../src/data/updates.json', import.meta.url);
const MAX_ENTRIES_PER_REPO = 5;
const MAX_ENTRIES_TOTAL = 50;

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

// Parse Keep-a-Changelog sections: `## [1.2.3] - 2024-07-27` (+ [Unreleased]).
// Returns [{ version, date|null, summary[], upcoming }], newest first.
function parseChangelog(md) {
  const entries = [];
  let cur = null;
  for (const line of md.split('\n')) {
    const h = line.match(/^##\s+\[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
    if (h) {
      cur = {
        version: h[1],
        date: h[2] ?? null,
        upcoming: h[1].toLowerCase() === 'unreleased',
        summary: [],
      };
      entries.push(cur);
    } else if (cur && /^[-*]\s+/.test(line)) {
      cur.summary.push(line.replace(/^[-*]\s+/, '').trim());
    }
  }
  return entries.filter((e) => e.summary.length || e.upcoming);
}

// Updates feed: CHANGELOG.md versions when present, else recent commits.
// summary is always string[]; upcoming entries sort before dated ones.
async function fetchUpdates(list) {
  const updates = [];
  for (const r of list) {
    try {
      const c = await fetchJson(
        `https://api.github.com/repos/${ORG}/${r.name}/contents/CHANGELOG.md`,
      );
      const md = Buffer.from(c.content, 'base64').toString('utf8');
      for (const e of parseChangelog(md).slice(0, MAX_ENTRIES_PER_REPO)) {
        updates.push({ repo: r.name, url: r.html_url, ...e });
      }
    } catch {
      try {
        const commits = await fetchJson(
          `https://api.github.com/repos/${ORG}/${r.name}/commits?per_page=${MAX_ENTRIES_PER_REPO}`,
        );
        for (const cm of commits) {
          updates.push({
            repo: r.name,
            url: cm.html_url,
            version: cm.sha.slice(0, 7),
            date: String(cm.commit?.committer?.date ?? '').slice(0, 10) || null,
            upcoming: false,
            summary: [String(cm.commit?.message ?? '').split('\n')[0]],
          });
        }
      } catch (e) {
        console.warn(`[updates] skipped ${r.name}: ${e.message}`);
      }
    }
  }
  updates.sort((a, b) =>
    a.upcoming !== b.upcoming ? (a.upcoming ? -1 : 1) : (b.date ?? '').localeCompare(a.date ?? ''),
  );
  return updates.slice(0, MAX_ENTRIES_TOTAL);
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

  // Updates feed — only overwrite on success so a flaky build keeps last-good data.
  const updates = await fetchUpdates(list);
  if (updates.length) {
    await writeFile(UPDATES_OUT, JSON.stringify(updates, null, 2));
  } else {
    try {
      await access(UPDATES_OUT);
      console.warn('[updates] no entries fetched; keeping last-good updates.json');
    } catch {
      await writeFile(UPDATES_OUT, '[]');
    }
  }
  console.log(`[updates] ${updates.length} feed entries`);
} catch (err) {
  console.warn(`[repos] fetch failed (${err.message}); writing empty grid`);
  await mkdir(new URL('./', REPOS_OUT), { recursive: true });
  await writeFile(REPOS_OUT, JSON.stringify([]));
  // Keep last-good updates.json if present; ensure the file exists for the build.
  try {
    await access(UPDATES_OUT);
  } catch {
    await writeFile(UPDATES_OUT, '[]');
  }
}
