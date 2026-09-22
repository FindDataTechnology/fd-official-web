import { access, mkdir, writeFile } from 'node:fs/promises';
import { readJson, activeConcepts, buildModuleSnapshot, coverageSummary } from './data-module-utils.mjs';

const ROOT = new URL('../', import.meta.url);
const CURATED = new URL('src/data/data-modules.curated.json', ROOT);
const INDICATORS = new URL('src/data/indicators.json', ROOT);
const OUT = new URL('src/data/data-modules.json', ROOT);

async function fallbackSnapshot(message) {
  const curated = await readJson(CURATED).catch(() => ({ modules: [] }));
  const snapshot = {
    generated_at: new Date().toISOString(),
    source: 'fallback',
    fallback_reason: message,
    indicators_as_of: null,
    modules: (curated.modules ?? []).map((module) => ({
      ...module,
      indicator_count: 0,
      mapped_indicator_count: 0,
      coverage_rate: 0,
      filter_params: module.filter ?? {},
      deep_link: '/indicators',
      stats: { ...(module.stats ?? {}), indicators: 0, mapped_indicators: 0 },
    })),
    coverage: { total: 0, covered: 0, uncovered_concepts: [], coverage_rate: 0 },
  };
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
}

async function main() {
  const curated = await readJson(CURATED);
  const indicators = await readJson(INDICATORS);
  const concepts = activeConcepts(indicators);
  const modules = (curated.modules ?? []).map((module) => buildModuleSnapshot(module, concepts));
  const snapshot = {
    generated_at: new Date().toISOString(),
    source: 'curated+indicators',
    indicators_as_of: indicators.generated_at ?? null,
    modules,
    coverage: coverageSummary(modules, concepts),
  };
  await mkdir(new URL('./', OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `[data-modules] wrote ${modules.length} modules; ${snapshot.coverage.covered}/${snapshot.coverage.total} active concepts mapped`,
  );
}

try {
  await main();
} catch (err) {
  console.warn(`[data-modules] aggregation failed (${err.message}); keeping last-good snapshot`);
  try {
    await access(OUT);
  } catch {
    await fallbackSnapshot(err.message);
  }
}
