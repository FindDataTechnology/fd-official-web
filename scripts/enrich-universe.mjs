// Merge the fd-open-data-mcp metadata registry's full-universe numbers into
// src/data/indicators.json. list_concepts (fetch-indicators.mjs) only sees the
// curated ontology (~255 concepts); the registry also knows the raw indicator
// universe — every function column across every discovered datasource — plus
// the concept↔column bindings that power the word-cloud weights.
//
// Idempotent and non-destructive: concepts (and their sample series) pass
// through untouched; only `universe` and per-concept `bindings` are (re)written.
// On any error it exits 0 without touching the file (same policy as the other
// fetch scripts), so `astro build` never breaks.
//
// Env:
//   FD_INDICATORS_REGISTRY_DB   default ../../fd-open-data-mcp/fd_open_data_mcp/metadata/daas.db
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const OUT = new URL('../src/data/indicators.json', import.meta.url);
const DB = new URL(
  process.env.FD_INDICATORS_REGISTRY_DB ?? '../../fd-open-data-mcp/fd_open_data_mcp/metadata/daas.db',
  import.meta.url,
);

function q(sql) {
  const out = execFileSync('sqlite3', ['-json', DB.pathname, sql], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return out.trim() ? JSON.parse(out) : [];
}

function one(sql) {
  const rows = q(sql);
  return rows.length ? Number(Object.values(rows[0])[0]) : 0;
}

try {
  if (!existsSync(DB)) throw new Error(`registry not found: ${DB.pathname}`);

  const universe = {
    functions: one('SELECT COUNT(*) FROM functions'),
    columns: one('SELECT COUNT(*) FROM columns'),
    sources: one('SELECT COUNT(*) FROM sources'),
    bindings: one('SELECT COUNT(*) FROM concept_bindings'),
    columns_by_source: q(
      'SELECT s.name AS label, COUNT(c.id) AS value FROM columns c ' +
        'JOIN functions f ON c.function_id = f.id JOIN sources s ON f.source_id = s.id ' +
        'GROUP BY s.name ORDER BY value DESC LIMIT 12',
    ).map((r) => ({ label: r.label, value: Number(r.value) })),
    functions_by_source: q(
      'SELECT s.name AS label, COUNT(*) AS value FROM functions f ' +
        'JOIN sources s ON f.source_id = s.id GROUP BY s.name ORDER BY value DESC LIMIT 12',
    ).map((r) => ({ label: r.label, value: Number(r.value) })),
    // Full search index: every registry column with its function and source.
    column_index: q(
      'SELECT c.name AS n, f.command AS f, s.name AS s FROM columns c ' +
        'JOIN functions f ON c.function_id = f.id JOIN sources s ON f.source_id = s.id',
    ).map((r) => ({ n: r.n, f: r.f, s: r.s })),
    generated_at: new Date().toISOString(),
    registry: 'fd-open-data-mcp/metadata/daas.db',
  };

  const perConcept = new Map(
    q('SELECT concept_id, COUNT(*) AS n FROM concept_bindings GROUP BY concept_id').map((r) => [
      Number(r.concept_id),
      Number(r.n),
    ]),
  );

  const data = JSON.parse(await readFile(OUT, 'utf8'));
  for (const c of data.concepts ?? []) c.bindings = perConcept.get(c.id) ?? 0;
  data.universe = universe;
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(
    `[universe] ${universe.columns} indicators / ${universe.functions} functions / ${universe.sources} sources / ` +
      `${universe.bindings} bindings / ${universe.column_index.length} search rows merged into src/data/indicators.json`,
  );
} catch (err) {
  console.warn(`[universe] enrichment failed (${err.message}); keeping existing indicators.json`);
}
