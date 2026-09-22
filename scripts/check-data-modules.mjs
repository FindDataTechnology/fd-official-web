// Build-time coverage check for curated data-module mappings.
import { readJson, activeConcepts, coverageSummary } from './data-module-utils.mjs';

const ROOT = new URL('../', import.meta.url);
const curated = await readJson(new URL('src/data/data-modules.curated.json', ROOT));
const indicators = await readJson(new URL('src/data/indicators.json', ROOT));
const summary = coverageSummary(curated.modules ?? [], activeConcepts(indicators));

console.log(
  `[data-modules] coverage ${summary.covered}/${summary.total} (${Math.round(summary.coverage_rate * 1000) / 10}%)`,
);
if (summary.uncovered.length) {
  console.log(`[data-modules] unmapped concepts: ${summary.uncovered_codes.join(', ') || '(none)'}`);
  for (const concept of summary.uncovered) {
    console.log(`  - ${concept.id ?? '?'} ${concept.code} [${concept.source ?? '—'} / ${concept.category ?? '—'}]`);
  }
}
