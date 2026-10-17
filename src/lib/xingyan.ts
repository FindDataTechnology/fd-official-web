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

// ── machine-readable feed (/briefings.json) ─────────────────────────────────
// The distribution pipeline (VAAS multi-platform push, social drafts) consumes
// this instead of scraping HTML — the same build-time export pattern as
// /releases.json, one build, one collection, one twins gate. One record per
// briefing with both locales side by side, newest first.

export async function buildBriefingsFeed() {
  const { briefings } = await loadXingyanSurface();
  const entries = briefings.en.map((en) => {
    const slug = slugOf(en);
    // Guaranteed present: the twins gate above already failed the build
    // otherwise.
    const zh = briefings.zh.find((z) => slugOf(z) === slug)!;
    return {
      slug,
      date: en.data.date,
      tags: [...en.data.tags],
      title: { en: en.data.title, zh: zh.data.title },
      summary: { en: en.data.summary, zh: zh.data.summary },
      sources: { en: [...en.data.sources], zh: [...zh.data.sources] },
      body: { en: en.body ?? '', zh: zh.body ?? '' },
      url: { en: `/research/briefings/${slug}`, zh: `/zh/research/briefings/${slug}` },
    };
  });
  return { generated_at: new Date().toISOString(), briefings: entries };
}
