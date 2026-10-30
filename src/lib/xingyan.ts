import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { checkLocaleTwins, splitByLocale, type LocaleSplit } from './twins';

// Shared loading + integrity checks for the Xingyan (星研) research line's
// three paired collections. Both locale pages (the three-column /research
// surface and the three detail routes) and the /briefings.json feed derive
// from this one module, so what the pipeline consumes can never drift from
// what the pages render — same discipline as lib/releases.ts.

export type XingyanLocale = 'en' | 'zh';

// The paired CMS collections this module owns. `updates` is deliberately absent:
// it is a field-paired collection (both languages on one record) with its own
// loader, not a locale-paired one.
export type XingyanCollection = 'briefings' | 'academy' | 'research';

export type BriefingEntry = CollectionEntry<'briefings'>;
export type CourseEntry = CollectionEntry<'academy'>;
export type ArticleEntry = CollectionEntry<'research'>;

// Slug = filename under the locale dir (en/2026-10-15-slug.md → 2026-10-15-slug).
export const slugOf = (entry: { id: string }): string => entry.id.split('/')[1] ?? entry.id;

export interface XingyanSurface {
  /** 内参 briefings — newest first. */
  briefings: LocaleSplit<BriefingEntry>;
  /** 学院 courses — teaching order. */
  courses: LocaleSplit<CourseEntry>;
  /** 研究 articles — newest first. */
  articles: LocaleSplit<ArticleEntry>;
}

// Briefings and research pieces carry a date: newest first, slug breaks ties so
// the order is stable across builds.
const newestFirst = <T extends { id: string; data: { date: string } }>(a: T, b: T) =>
  b.data.date.localeCompare(a.data.date) || slugOf(a).localeCompare(slugOf(b));

// Courses read in teaching order; the slug breaks ties.
const courseOrder = (a: CourseEntry, b: CourseEntry) =>
  a.data.order - b.data.order || slugOf(a).localeCompare(slugOf(b));

// Academy courses by declared reader tier (yizuo-course-system). `use` is the
// default teaching path; `build` courses are the advanced tier and MUST NOT
// appear inside the use group (spec: use 分组不列 build 课程). Undeclared
// courses (存量未回填 level) form their own tail group — they are neither use
// nor build and must not leak into either.
export type CourseTier = 'use' | 'build' | 'undeclared';
export const tierOf = (course: CourseEntry): CourseTier =>
  course.data.level === 'use' || course.data.level === 'build' ? course.data.level : 'undeclared';
export function splitByTier(list: CourseEntry[]): Record<CourseTier, CourseEntry[]> {
  const groups: Record<CourseTier, CourseEntry[]> = { use: [], build: [], undeclared: [] };
  for (const course of list) groups[tierOf(course)].push(course);
  return groups;
}

// Load one paired collection: split by locale, enforce the twins gate, sort
// each side with the collection's own comparator. The three Xingyan
// collections have different data shapes (courses order by `order`, feeds by
// `date`), so what is shared is the mechanism — one implementation of the
// load/split/twins/sort invariant — not a single loop over interchangeable
// rows. Adding a fourth paired collection is one call here plus its zod schema.
async function loadPaired<C extends XingyanCollection>(
  collection: C,
  kindLabel: string,
  compare: (a: CollectionEntry<C>, b: CollectionEntry<C>) => number,
): Promise<LocaleSplit<CollectionEntry<C>>> {
  const split = splitByLocale(await getCollection(collection));
  checkLocaleTwins(collection, kindLabel, split, slugOf);
  split.en.sort(compare);
  split.zh.sort(compare);
  return split;
}

// Load all three collections, enforce the bilingual twins gate on each, return
// them sorted per locale. An empty collection is legal — the surface renders
// its empty state (a line whose first entries are still being written).
export async function loadXingyanSurface(): Promise<XingyanSurface> {
  const [briefings, courses, articles] = await Promise.all([
    loadPaired('briefings', 'briefing', newestFirst),
    loadPaired('academy', 'course', courseOrder),
    loadPaired('research', 'research piece', newestFirst),
  ]);
  return { briefings, courses, articles };
}

// ── machine-readable feeds (/briefings.json, /academy.json, /research.json) ──
// Machine consumers (the distribution pipeline, customer agents, answer
// engines) read these instead of scraping HTML — the same build-time export
// pattern as /releases.json: one build, one collection, one twins gate. One
// record per entry with both locales side by side; the claim skeleton rides
// along so an agent can resolve `slug/claim-id` down to evidence without
// parsing prose. The three collections differ only in ordering and a couple of
// type-specific fields, so the builder is parameterized rather than triplicated.

// Where each zone lives on the site (the collection name is not always the URL
// segment: research articles are served under /research/articles/).
const ZONE_PATH: Record<XingyanCollection, string> = {
  briefings: 'briefings',
  academy: 'academy',
  research: 'articles',
};

function feedRecord(en: CollectionEntry<XingyanCollection>, zh: CollectionEntry<XingyanCollection>) {
  const slug = slugOf(en);
  const zone = ZONE_PATH[en.collection as XingyanCollection];
  // Both twins carry the same extra fields by collection; read them off `en`
  // and let absent ones stay out of the record instead of emitting null keys.
  const d = en.data as Record<string, unknown>;
  const dz = zh.data as Record<string, unknown>;
  const extra: Record<string, unknown> = {};
  for (const key of ['kind', 'level', 'order'] as const) {
    if (key in d) extra[key] = d[key];
  }
  return {
    slug,
    ...('date' in d ? { date: d.date } : {}),
    ...('updated' in d ? { updated: d.updated } : {}),
    ...extra,
    tags: [...((d.tags as string[]) ?? [])],
    title: { en: d.title, zh: dz.title },
    summary: { en: d.summary, zh: dz.summary },
    sources: { en: [...((d.sources as unknown[]) ?? [])], zh: [...((dz.sources as unknown[]) ?? [])] },
    // Same claim IDs on both sides; each side carries its own section anchors
    // (the heading text follows the language).
    claims: { en: [...((d.claims as unknown[]) ?? [])], zh: [...((dz.claims as unknown[]) ?? [])] },
    body: { en: en.body ?? '', zh: zh.body ?? '' },
    url: { en: `/research/${zone}/${slug}`, zh: `/zh/research/${zone}/${slug}` },
  };
}

async function buildZoneFeed<C extends XingyanCollection>(
  collection: C,
  en: CollectionEntry<C>[],
  zh: CollectionEntry<C>[],
) {
  const entries = en.map((e) => {
    const slug = slugOf(e);
    // Guaranteed present: the twins gate above already failed the build
    // otherwise.
    const z = zh.find((x) => slugOf(x) === slug)!;
    return feedRecord(e as CollectionEntry<XingyanCollection>, z as CollectionEntry<XingyanCollection>);
  });
  return { generated_at: new Date().toISOString(), [collection]: entries };
}

export async function buildBriefingsFeed() {
  const { briefings } = await loadXingyanSurface();
  return buildZoneFeed('briefings', briefings.en, briefings.zh);
}

// 学院 / 研究 两路机读面：AI 消费者取 claim 骨架与双语页面地址，不经 HTML。
export async function buildAcademyFeed() {
  const { courses } = await loadXingyanSurface();
  return buildZoneFeed('academy', courses.en, courses.zh);
}

export async function buildResearchFeed() {
  const { articles } = await loadXingyanSurface();
  return buildZoneFeed('research', articles.en, articles.zh);
}
