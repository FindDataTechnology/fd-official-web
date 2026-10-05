#!/usr/bin/env node
// Content-integrity gate (official-web-content-truth): site-authored copy must
// never reference retired organizations, domains, or infrastructure.
//
// Out of scope on purpose: src/content/repos/ is the build-time GitHub mirror
// (regenerated from upstream READMEs every build) — retirements there are
// handled on GitHub itself (see the change's repo-descriptions deliverable).
//
// Usage:
//   node scripts/check-content-integrity.mjs [paths...]   # default: src
//   node scripts/check-content-integrity.mjs --self-test  # matcher sanity check
//
// Extending: add an entry to RETIRED below — no other change needed.

import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const RETIRED = [
  { id: 'FindDataOfficial', pattern: /FindDataOfficial/ },
  { id: 'craw.finddatatech.cloud', pattern: /craw\.finddatatech\.cloud/i },
  { id: 'Scrapyd (retired crawl stack)', pattern: /scrapyd/i },
];

// Directory names skipped when scanned directly under src/content/.
const MIRROR_DIR = join('src', 'content', 'repos'); // build-time GitHub mirror — out of scope
const EXTS = new Set(['.md', '.mdx', '.astro', '.ts', '.mts', '.js', '.mjs', '.json', '.html']);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (p === MIRROR_DIR || p.endsWith(`/${MIRROR_DIR}`)) continue;
      yield* walk(p);
    } else if (EXTS.has(extname(e.name))) {
      yield p;
    }
  }
}

function scanText(file, text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const r of RETIRED) {
      if (r.pattern.test(line)) {
        hits.push({ file, line: i + 1, id: r.id, snippet: line.trim().slice(0, 120) });
      }
    }
  });
  return hits;
}

async function selfTest() {
  const samples = [
    ['FindDataOfficial', 'the code lives on the FindDataOfficial GitHub org', true],
    ['craw.finddatatech.cloud', 'see https://CRAW.FindDataTech.Cloud/entry', true],
    ['Scrapyd', 'runs as a CronJob on a Scrapyd crawl stack', true],
    ['negative control', 'the FindDataTechnology org, at platform.finddatatech.cloud', false],
  ];
  let ok = true;
  for (const [id, sample, expect] of samples) {
    const hit = RETIRED.some((r) => r.pattern.test(sample));
    const pass = hit === expect;
    ok = ok && pass;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${expect ? 'detect' : 'clean'}: ${id}`);
  }
  process.exit(ok ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) await selfTest();

const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) targets.push('src');

const files = [];
for (const t of targets) {
  const s = await stat(t).catch(() => null);
  if (!s) {
    console.error(`[content-integrity] path not found: ${t}`);
    process.exit(2);
  }
  if (s.isDirectory()) {
    for await (const f of walk(t)) files.push(f);
  } else {
    files.push(t);
  }
}
files.sort();

const hits = [];
for (const f of files) {
  const text = await readFile(f, 'utf8').catch(() => null);
  if (text != null) hits.push(...scanText(f, text));
}

if (hits.length) {
  console.error(`[content-integrity] ${hits.length} retired-identifier hit(s):`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  [${h.id}]  ${h.snippet}`);
  console.error('\nRetired surfaces are defined in official-web-content-truth (specs/content-integrity).');
  process.exit(1);
}
console.log(
  `[content-integrity] clean — ${files.length} file(s) scanned against ${RETIRED.length} retired identifiers, 0 hits`,
);
