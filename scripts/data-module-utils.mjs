import { readFile } from 'node:fs/promises';

export async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

export function activeConcepts(payload) {
  return (payload?.concepts ?? []).filter((concept) => !concept.deprecated);
}

function matchesRule(concept, rule = {}) {
  const source = concept.source ?? '—';
  const category = concept.category ?? '—';
  const entityType = concept.entity_type ?? '—';
  const sources = rule.sources ?? [];
  const categories = rule.categories ?? [];
  const entityTypes = rule.entity_types ?? [];
  const codes = rule.codes ?? [];
  const prefixes = rule.code_prefixes ?? [];

  if (sources.length && !sources.includes(source)) return false;
  if (categories.length && !categories.includes(category)) return false;
  if (entityTypes.length && !entityTypes.includes(entityType)) return false;
  if ((codes.length || prefixes.length) && !codes.includes(concept.code) && !prefixes.some((prefix) => concept.code.startsWith(prefix))) {
    return false;
  }
  return true;
}

export function matchesMapping(concept, mapping = {}) {
  if (Array.isArray(mapping.rules)) {
    return mapping.rules.some((rule) => matchesRule(concept, rule));
  }
  return matchesRule(concept, mapping);
}

export function matchesFilter(concept, filter = {}) {
  const source = concept.source ?? '—';
  const category = concept.category ?? '—';
  if (filter.source && source !== filter.source) return false;
  if (filter.category && category !== filter.category) return false;
  return true;
}

export function buildModuleSnapshot(module, concepts) {
  const mapped = concepts.filter((concept) => matchesMapping(concept, module.mapping));
  const filtered = concepts.filter((concept) => matchesFilter(concept, module.filter));
  const filterParams = { ...(module.filter ?? {}) };
  const query = new URLSearchParams();
  if (filterParams.source) query.set('source', filterParams.source);
  if (filterParams.category) query.set('category', filterParams.category);
  const queryString = query.toString();

  return {
    ...module,
    indicator_count: filtered.length,
    mapped_indicator_count: mapped.length,
    coverage_rate: concepts.length ? mapped.length / concepts.length : 0,
    filter_params: filterParams,
    deep_link: queryString ? `/indicators?${queryString}` : '/indicators',
    stats: {
      ...(module.stats ?? {}),
      indicators: filtered.length,
      mapped_indicators: mapped.length,
    },
  };
}

export function coverageSummary(modules, concepts) {
  const covered = new Set();
  for (const concept of concepts) {
    if (modules.some((module) => matchesMapping(concept, module.mapping))) {
      covered.add(`${concept.id ?? ''}:${concept.source ?? ''}:${concept.category ?? ''}:${concept.code}`);
    }
  }
  const uncoveredConcepts = concepts.filter(
    (concept) =>
      !covered.has(`${concept.id ?? ''}:${concept.source ?? ''}:${concept.category ?? ''}:${concept.code}`),
  );
  const uncovered = uncoveredConcepts
    .map((concept) => ({
      id: concept.id ?? null,
      code: concept.code,
      source: concept.source ?? null,
      category: concept.category ?? null,
      entity_type: concept.entity_type ?? null,
    }))
    .sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')) || a.code.localeCompare(b.code));
  return {
    total: concepts.length,
    covered: covered.size,
    uncovered,
    uncovered_codes: [...new Set(uncoveredConcepts.map((concept) => concept.code))].sort(),
    coverage_rate: concepts.length ? covered.size / concepts.length : 0,
  };
}
