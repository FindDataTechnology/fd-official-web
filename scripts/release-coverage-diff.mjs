// Authoring-time tool for the release-notes coverage section. Never wired
// into `npm run build` — the pages render committed markdown only.
//
// Usage: node scripts/release-coverage-diff.mjs <slug>
//   <slug> = the issue's period end date (YYYY-MM-DD), same as the issue's md
//   filename. Commits belong together: the issue's markdown AND the snapshot.
//
// 1. Rebuilds src/data/data-modules.json from the committed indicators.json
//    (same source the /data page renders — not a second pipeline).
// 2. Captures a slim per-module snapshot to
//    src/data/release-snapshots/<slug>.json (with generated_at).
// 3. Prints the per-module diff against the newest previous snapshot — the
//    verified numbers the issue's coverage section is allowed to quote.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const ROOT_DIR = fileURLToPath(ROOT);
const SNAP_DIR = new URL('src/data/release-snapshots/', ROOT);
const DATA_MODULES = new URL('src/data/data-modules.json', ROOT);

const slug = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(slug ?? '')) {
  console.error(
    'usage: node scripts/release-coverage-diff.mjs <slug>\n' +
      '  slug = the issue period end date YYYY-MM-DD (same as the issue md filename)',
  );
  process.exit(1);
}

// 1. Fresh data-modules snapshot from committed inputs.
const build = spawnSync('node', ['scripts/build-data-modules.mjs'], {
  cwd: ROOT_DIR,
  stdio: ['ignore', 'inherit', 'inherit'],
});
if (build.status !== 0) process.exit(build.status ?? 1);

// 2. Slim extract — only the figures the coverage section quotes.
const dm = JSON.parse(await readFile(DATA_MODULES, 'utf8'));
const sum = (key) => dm.modules.reduce((n, m) => n + (m[key] ?? 0), 0);
const snapshot = {
  generated_at: new Date().toISOString(),
  data_modules_as_of: dm.generated_at ?? null,
  totals: {
    modules: dm.modules.length,
    indicators: sum('indicator_count'),
    mapped_indicator_count: sum('mapped_indicator_count'),
    active_concepts: dm.coverage?.total ?? null,
    covered_concepts: dm.coverage?.covered ?? null,
    coverage_rate: dm.coverage?.coverage_rate ?? null,
  },
  modules: dm.modules.map((m) => ({
    id: m.id,
    indicators: m.indicator_count ?? 0,
    mapped_indicator_count: m.mapped_indicator_count ?? 0,
    coverage_rate: m.coverage_rate ?? 0,
  })),
};
await mkdir(SNAP_DIR, { recursive: true });
await writeFile(new URL(`${slug}.json`, SNAP_DIR), JSON.stringify(snapshot, null, 2) + '\n');
console.log(
  `[releases] snapshot written: src/data/release-snapshots/${slug}.json ` +
    `(${snapshot.modules.length} modules, as of ${snapshot.data_modules_as_of})`,
);

// 3. Diff against the newest previous snapshot (slug sort = date sort).
const others = (await readdir(SNAP_DIR))
  .filter((f) => f.endsWith('.json') && f !== `${slug}.json`)
  .sort();
const prevFile = others[others.length - 1];
if (!prevFile) {
  console.log(
    '[releases] no previous snapshot — baseline issue: quote current-state figures from the totals above',
  );
  process.exit(0);
}
const prev = JSON.parse(await readFile(new URL(prevFile, SNAP_DIR), 'utf8'));
const fmt = (n) => (n == null ? '—' : String(n));
const pct = (r) => (r == null ? '—' : `${(r * 100).toFixed(1)}%`);
const delta = (a, b) => (a == null || b == null ? '' : b - a === 0 ? '' : ` (${b - a > 0 ? '+' : ''}${b - a})`);

console.log(`\n[releases] diff vs previous snapshot ${prevFile} (as of ${prev.data_modules_as_of ?? '?'})\n`);
const prevById = new Map(prev.modules.map((m) => [m.id, m]));
const curById = new Map(snapshot.modules.map((m) => [m.id, m]));
const ids = [...new Set([...prev.modules.map((m) => m.id), ...snapshot.modules.map((m) => m.id)])];
for (const id of ids.sort()) {
  const a = prevById.get(id);
  const b = curById.get(id);
  if (!a) {
    console.log(`  ${id}: NEW module — ${b.indicators} indicators, ${b.mapped_indicator_count} mapped`);
  } else if (!b) {
    console.log(`  ${id}: REMOVED module (was ${a.indicators} indicators, ${a.mapped_indicator_count} mapped)`);
  } else {
    const pp =
      a.coverage_rate == null || b.coverage_rate == null
        ? ''
        : `${((b.coverage_rate - a.coverage_rate) * 100).toFixed(1) === '0.0' ? '' : ` (${(b.coverage_rate - a.coverage_rate) * 100 > 0 ? '+' : ''}${((b.coverage_rate - a.coverage_rate) * 100).toFixed(1)}pp)`}`;
    console.log(
      `  ${id}: indicators ${fmt(a.indicators)}→${fmt(b.indicators)}${delta(a.indicators, b.indicators)}` +
        ` · mapped ${fmt(a.mapped_indicator_count)}→${fmt(b.mapped_indicator_count)}${delta(a.mapped_indicator_count, b.mapped_indicator_count)}` +
        ` · coverage ${pct(a.coverage_rate)}→${pct(b.coverage_rate)}${pp}`,
    );
  }
}
console.log(
  `\n  TOTALS: indicators ${fmt(prev.totals.indicators)}→${fmt(snapshot.totals.indicators)}${delta(prev.totals.indicators, snapshot.totals.indicators)}` +
    ` · mapped ${fmt(prev.totals.mapped_indicator_count)}→${fmt(snapshot.totals.mapped_indicator_count)}${delta(prev.totals.mapped_indicator_count, snapshot.totals.mapped_indicator_count)}` +
    ` · active concepts ${fmt(prev.totals.active_concepts)}→${fmt(snapshot.totals.active_concepts)}${delta(prev.totals.active_concepts, snapshot.totals.active_concepts)}`,
);
console.log('\n[releases] paste verified figures from this output into the issue coverage section — never from memory.');
