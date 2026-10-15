// Shared bilingual-twins gate for the site's paired content collections.
//
// Paired collections store one committed file per entry per locale
// (`<locale>/<slug>.md`): an entry that exists in only one locale would render
// a half-translated site, so it fails the build naming the missing slug — the
// same fail-the-build pattern as lib/releases.ts's checkLocaleTwins, lifted
// here so the Xingyan (星研) collections share one implementation.
//
// (lib/releases.ts keeps its own copy: the release-notes loader is
// five-line-facing surface and stays untouched — xingyan-research-line.)

export interface LocaleSplit<T> {
  en: T[];
  zh: T[];
}

// Bucket entries by the leading id segment (en/…, zh/…). Ids with any other
// prefix are ignored: each collection's loader owns its own id convention.
export function splitByLocale<T extends { id: string }>(entries: T[]): LocaleSplit<T> {
  const split: LocaleSplit<T> = { en: [], zh: [] };
  for (const entry of entries) {
    const locale = entry.id.split('/')[0];
    if (locale === 'en' || locale === 'zh') split[locale].push(entry);
  }
  return split;
}

// Fail the build when one side of a twin pair is missing, naming the slug, the
// direction it is missing in, and the file the author has to add.
export function checkLocaleTwins<T>(
  collection: string,
  kind: string,
  split: LocaleSplit<T>,
  slugOf: (entry: T) => string,
): void {
  const enSlugs = new Set(split.en.map(slugOf));
  const zhSlugs = new Set(split.zh.map(slugOf));
  for (const slug of enSlugs) {
    if (!zhSlugs.has(slug))
      throw new Error(
        `${kind} "${slug}" exists in en/ but has no zh/ counterpart — add src/content/${collection}/zh/${slug}.md`,
      );
  }
  for (const slug of zhSlugs) {
    if (!enSlugs.has(slug))
      throw new Error(
        `${kind} "${slug}" exists in zh/ but has no en/ counterpart — add src/content/${collection}/en/${slug}.md`,
      );
  }
}
