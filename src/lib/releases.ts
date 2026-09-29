import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { PRODUCT_LINES } from '../content.config';
import { ui } from '../i18n';

// Shared release-notes loading + integrity checks. Both locale pages and the
// /releases.json endpoint derive from this one module, so the feed can never
// drift from the rendered pages. Fail-the-build pattern mirrors the products
// pages' slug-collision guard.
export type ReleaseEntry = CollectionEntry<'releases'>;

// Slug = filename under the locale dir (en/2026-09-29.md → 2026-09-29). The
// slug is the issue's period end date, so ISO string sort is date sort.
export const slugOf = (e: ReleaseEntry): string => e.id.split('/')[1] ?? e.id;

const newestFirst = (a: ReleaseEntry, b: ReleaseEntry) =>
  slugOf(b).localeCompare(slugOf(a));

export interface ReleaseIssues {
  en: ReleaseEntry[];
  zh: ReleaseEntry[];
}

// Locale pairing: an issue that exists in one locale but not the other would
// render a single-locale site half — fail the build naming the issue instead.
function checkLocaleTwins(issues: ReleaseIssues): void {
  const enSlugs = new Set(issues.en.map(slugOf));
  const zhSlugs = new Set(issues.zh.map(slugOf));
  for (const slug of enSlugs) {
    if (!zhSlugs.has(slug))
      throw new Error(
        `release issue "${slug}" exists in en/ but has no zh/ counterpart — add zh/${slug}.md`,
      );
  }
  for (const slug of zhSlugs) {
    if (!enSlugs.has(slug))
      throw new Error(
        `release issue "${slug}" exists in zh/ but has no en/ counterpart — add en/${slug}.md`,
      );
  }
}

// The schema's z.enum already rejects unknown lines at collection load; this
// keeps the page module authoritative too (same defense as products/[slug]).
function checkLines(issues: ReleaseIssues): void {
  for (const e of [...issues.en, ...issues.zh]) {
    for (const line of e.data.lines) {
      if (!(PRODUCT_LINES as readonly string[]).includes(line))
        throw new Error(
          `release issue "${slugOf(e)}" declares unknown line "${line}" — use one of ${PRODUCT_LINES.join(', ')}`,
        );
    }
  }
}

// Consecutive issues must not overlap (periods are inclusive day ranges).
function checkPeriodOverlaps(issues: ReleaseIssues): void {
  for (const loc of ['en', 'zh'] as const) {
    const asc = [...issues[loc]].sort((a, b) =>
      a.data.period_start.localeCompare(b.data.period_start),
    );
    for (let i = 1; i < asc.length; i++) {
      const prev = asc[i - 1];
      const cur = asc[i];
      if (cur.data.period_start <= prev.data.period_end)
        throw new Error(
          `release issues "${slugOf(prev)}" (${prev.data.period_start}…${prev.data.period_end}) and ` +
            `"${slugOf(cur)}" (${cur.data.period_start}…${cur.data.period_end}) overlap in ${loc}/ — consecutive issues must not overlap`,
        );
    }
  }
}

// Load both locale collections, validate, return newest-first per locale.
export async function loadReleaseIssues(): Promise<ReleaseIssues> {
  const all = await getCollection('releases');
  const issues: ReleaseIssues = { en: [], zh: [] };
  for (const e of all) {
    const loc = e.id.split('/')[0];
    if (loc === 'en' || loc === 'zh') issues[loc].push(e);
  }
  issues.en.sort(newestFirst);
  issues.zh.sort(newestFirst);
  checkLocaleTwins(issues);
  checkLines(issues);
  checkPeriodOverlaps(issues);
  return issues;
}

// ── machine-readable feed (/releases.json) ─────────────────────────────────
// Downstream outlets (sales one-pager, social pipeline) consume this feed
// instead of scraping HTML. Everything derives from the same collection +
// committed snapshots as the rendered pages, in one build.

interface SnapshotModule {
  id: string;
  indicators: number;
  mapped_indicator_count: number;
  coverage_rate: number;
}

interface Snapshot {
  generated_at: string;
  data_modules_as_of: string | null;
  totals: Record<string, number | null>;
  modules: SnapshotModule[];
}

const snapshotFiles = import.meta.glob<Snapshot>('../data/release-snapshots/*.json', {
  eager: true,
  import: 'default',
});

function loadSnapshots(): Map<string, Snapshot> {
  const snapshots = new Map<string, Snapshot>();
  for (const [path, snap] of Object.entries(snapshotFiles)) {
    snapshots.set(path.split('/').pop()!.replace(/\.json$/, ''), snap);
  }
  return snapshots;
}

// Extract `## <heading>` sections from an issue body keyed by product line —
// the feed's per-line summaries. A heading must equal the line's localized
// label exactly (authoring convention, documented in the runbook).
export function extractLineSections(
  body: string,
  locale: 'en' | 'zh',
): Record<string, string> {
  const labels = new Map<string, string>();
  const dict = ui[locale] as Record<string, string>;
  for (const line of PRODUCT_LINES) labels.set(dict[`line.${line}`], line);
  const sections: Record<string, string> = {};
  let current: string | null = null;
  const buf = new Map<string, string[]>();
  for (const raw of body.split('\n')) {
    const h = raw.match(/^##\s+(.*)$/);
    if (h) {
      current = labels.get(h[1].trim()) ?? null;
      if (current) buf.set(current, []);
      continue;
    }
    if (current) buf.get(current)!.push(raw);
  }
  for (const [line, lines] of buf) {
    const text = lines.join('\n').trim();
    if (text) sections[line] = text;
  }
  return sections;
}

// Coverage delta between an issue's committed snapshot and its predecessor's
// (the newest committed snapshot with a smaller slug). The first issue has no
// predecessor: it bootstraps the baseline and quotes current-state figures.
function coverageFor(slug: string, snapshots: Map<string, Snapshot>) {
  const cur = snapshots.get(slug)!;
  const prevSlug = [...snapshots.keys()].filter((s) => s < slug).sort().pop();
  if (!prevSlug) {
    return { baseline: true, as_of: cur.data_modules_as_of, totals: cur.totals, delta: null };
  }
  const prev = snapshots.get(prevSlug)!;
  const prevById = new Map(prev.modules.map((m) => [m.id, m]));
  const curById = new Map(cur.modules.map((m) => [m.id, m]));
  const modules = [...new Set([...prevById.keys(), ...curById.keys()])]
    .sort()
    .map((id) => {
      const a = prevById.get(id);
      const b = curById.get(id);
      return {
        id,
        indicators: { from: a?.indicators ?? null, to: b?.indicators ?? null },
        mapped_indicator_count: { from: a?.mapped_indicator_count ?? null, to: b?.mapped_indicator_count ?? null },
        coverage_rate: { from: a?.coverage_rate ?? null, to: b?.coverage_rate ?? null },
      };
    })
    .filter(
      (m) =>
        m.indicators.from !== m.indicators.to ||
        m.mapped_indicator_count.from !== m.mapped_indicator_count.to ||
        m.coverage_rate.from !== m.coverage_rate.to,
    );
  const totals: Record<string, { from: number | null; to: number | null }> = {};
  for (const k of Object.keys(cur.totals)) {
    totals[k] = { from: prev.totals[k] ?? null, to: cur.totals[k] };
  }
  return { baseline: false, as_of: cur.data_modules_as_of, vs: prevSlug, totals: cur.totals, delta: { modules, totals } };
}

// The whole feed, newest-first — same order the pages render.
export async function buildReleaseFeed() {
  const issues = await loadReleaseIssues();
  const snapshots = loadSnapshots();
  const feed = [];
  for (const en of issues.en) {
    const slug = slugOf(en);
    const zh = issues.zh.find((z) => slugOf(z) === slug)!;
    if (!snapshots.has(slug))
      throw new Error(
        `release issue "${slug}" has no committed coverage snapshot — run \`node scripts/release-coverage-diff.mjs ${slug}\` and commit src/data/release-snapshots/${slug}.json together with the issue`,
      );
    const enSections = extractLineSections(en.body ?? '', 'en');
    const zhSections = extractLineSections(zh.body ?? '', 'zh');
    const sections: Record<string, { en: string | null; zh: string | null }> = {};
    for (const line of en.data.lines) {
      sections[line] = { en: enSections[line] ?? null, zh: zhSections[line] ?? null };
    }
    feed.push({
      slug,
      label: { en: en.data.label, zh: zh.data.label },
      period: { start: en.data.period_start, end: en.data.period_end },
      headline: { en: en.data.headline, zh: zh.data.headline },
      lines: [...en.data.lines],
      sections,
      coverage: coverageFor(slug, snapshots),
    });
  }
  return { generated_at: new Date().toISOString(), issues: feed };
}
