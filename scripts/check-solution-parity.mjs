#!/usr/bin/env node
// Parity gate between the solution package's single source (collateral/solution/
// *.md) and its published page (public/solution/index.html).
// openspec: reanchor-solution-package, design D2 — reconcile, don't generate.
//
// Why this exists: the page used to be hand-copied from the md into the site's
// static assets, and it drifted (the published copy grew a favicon link the
// source never had; the numbers diverged). A copy step nobody checks is not a
// build step. This script makes the three things that actually went wrong
// checkable: chapters, numbers, and demo entry URLs.
//
// Read-only. Non-zero exit names every difference.
//
// Usage:
//   node scripts/check-solution-parity.mjs              # check
//   node scripts/check-solution-parity.mjs --self-test  # prove the checks can fail
import { readFile } from 'node:fs/promises';

const MD = new URL('../collateral/solution/solution.md', import.meta.url);
const HTML = new URL('../public/solution/index.html', import.meta.url);
const NUMBERS = new URL('../src/data/solution-numbers.json', import.meta.url);

const CHAPTERS = ['一、', '二、', '三、', '四、', '五、'];
const CHAPTER_WORDS = { '一、': '理念篇', '二、': '架构篇', '三、': '实证篇', '四、': '场景篇', '五、': '试用篇' };

// Compare number tokens. Both sides are reduced to text before matching so the
// page's inline CSS and SVG coordinates (thousands of numbers that appear on one
// side only) don't drown the signal. Units are dropped on purpose: the page
// writes compact stats ("452 / 6 / 87") where the source writes "452 个指标概念".
const SKIP_RE = /^(19|20)\d{2}$/; // years, not claims
const ID_RE = /^\d{8,}$/; // filing/registration identifiers (ICP, 公安备案)

export function plainText(html) {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');
}

export function numbersIn(text) {
  const out = new Set();
  for (const m of plainText(text).matchAll(/(?<![\w.\-])(\d[\d,]*(?:\.\d+)?)/g)) {
    const raw = m[1].replace(/,/g, '');
    if (SKIP_RE.test(raw) || ID_RE.test(raw)) continue;
    if (/^\d$/.test(raw)) continue; // bare single digits are list numbers, not claims
    out.add(raw);
  }
  return out;
}

// Scene sections are a chapter's actual payload: the heading said "五个通用场景"
// while the page shipped four, and neither a number nor a chapter check could
// see it. Count both sides' scene units and compare them as sets.
export function scenesIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/^###\s*场景[一二三四五六七八九十]+[：:]\s*(.+)$/gm)) {
    out.add(m[1].trim());
  }
  return out;
}

// Section headings that claim a count ("五个通用场景") must match what follows.
export function chapterCountClaims(text) {
  const claims = [];
  for (const m of text.matchAll(/[一二三四五六七八九十]+、[^<\n]*?([一二三四五六七八九十]+)个[^<\n]*?(场景|看板|模板)/g)) {
    claims.push(m[0].trim());
  }
  return claims;
}

export function chaptersIn(text) {
  return CHAPTERS.filter((c) => text.includes(`<span class="no">${c}</span>`) || new RegExp(`^##\\s*${c}`, 'm').test(text));
}

export function demoTargets(text) {
  const out = new Set();
  for (const m of text.matchAll(/https?:\/\/(demo|www|wire|mcp)\.finddatatech\.cloud[^\s<>"')\]]*/g)) {
    const url = m[0].replace(/[.,;]+$/, '').replace(/\/+$/, '');
    if (url === 'https://www.finddatatech.cloud') continue; // footer's own-site link, not a demo entry
    out.add(url);
  }
  return out;
}

export function compare(mdText, htmlText) {
  const problems = [];

  const mdChapters = chaptersIn(mdText);
  const htmlChapters = chaptersIn(htmlText);
  for (const c of CHAPTERS) {
    const inMd = mdChapters.includes(c);
    const inHtml = htmlChapters.includes(c);
    if (inMd !== inHtml) problems.push(`章节 ${c} ${CHAPTER_WORDS[c]}：${inMd ? '真源有、页面无' : '页面有、真源无'}`);
  }

  // One direction only: every number on the page must still exist in the
  // source. That is exactly the drift that burned us — the page kept 53 after
  // the source moved to 87, and the orphaned 53 is what shows up here. The
  // reverse direction is noise: the page is a compact view and legitimately
  // omits detail numbers from the source's longer sections.
  const mdNums = numbersIn(mdText);
  const orphaned = [...numbersIn(htmlText)].filter((n) => !mdNums.has(n));
  if (orphaned.length) problems.push(`页面数字在真源中不存在（可能是页面落后）：${orphaned.join(', ')}`);

  const mdScenes = scenesIn(mdText);
  const htmlScenes = new Set();
  for (const m of htmlText.matchAll(/<h3>\s*场景[一二三四五六七八九十]+\s*·\s*(.+?)<\/h3>/g)) {
    htmlScenes.add(m[1].trim());
  }
  // Compare on the leading label before the separator: the source writes
  // "主题看板——指标到仪表盘" where the page writes "主题看板：指标到仪表盘".
  const leadOf = (t) => t.split(/[—:：]/)[0].trim();
  const htmlLeads = [...htmlScenes].map(leadOf);
  // The page may shorten or extend the label ("行业对账模板（ERP 板块）" vs
  // "行业对账模板"); a prefix match either way counts as the same scene.
  const matches = (lead) => htmlLeads.some((h) => h.startsWith(lead) || lead.startsWith(h));
  const missingScenes = [...mdScenes].filter((t) => !matches(leadOf(t)));
  if (missingScenes.length) problems.push(`场景真源有、页面无：${missingScenes.join(' / ')}`);
  if (mdScenes.size !== htmlScenes.size) problems.push(`场景数不一致：真源 ${mdScenes.size} / 页面 ${htmlScenes.size}`);

  const mdUrls = demoTargets(mdText);
  const htmlUrls = demoTargets(htmlText);
  const missing = [...mdUrls].filter((u) => !htmlUrls.has(u));
  if (missing.length) problems.push(`demo 入口真源有、页面无：${missing.join(', ')}`);

  return problems;
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has('--self-test')) {
    const md = '# 寻数\n## 一、理念篇\n有一句 452 个指标概念。\n## 二、架构篇\n## 三、实证篇\n## 四、场景篇\n## 五、试用篇\nhttps://demo.finddatatech.cloud\n';
    // The page renders chapter headings as <span class="no">一、</span>, not as
    // markdown '## ' — build the "good" HTML the same way the page does.
    const good = md
      .split('\n')
      .map((line) => (line.startsWith('## ') ? `<span class="no">${line.slice(3, 5)}</span>${line.slice(5)}` : line))
      .join('\n');
    if (compare(md, good).length !== 0) {
      console.error('[solution-parity] self-test FAIL: identical content reported differences');
      process.exit(1);
    }
    const drifted = good.replace('452', '453');
    if (!compare(md, drifted).some((p) => p.includes('453'))) {
      console.error('[solution-parity] self-test FAIL: an injected number drift was not caught');
      process.exit(1);
    }
    const missingChapter = good.replace(/<span class="no">四、<\/span>/, '');
    if (!compare(md, missingChapter).some((p) => p.includes('四、'))) {
      console.error('[solution-parity] self-test FAIL: a dropped chapter was not caught');
      process.exit(1);
    }
    console.log('[solution-parity] self-test ok (drift detected, clean input passes)');
    return;
  }

  const [mdText, htmlText] = await Promise.all([
    readFile(MD, 'utf8').catch(() => null),
    readFile(HTML, 'utf8').catch(() => null),
  ]);
  if (mdText == null) {
    console.error(`[solution-parity] missing source: ${MD.pathname}`);
    process.exit(1);
  }
  if (htmlText == null) {
    console.error(`[solution-parity] missing published page: ${HTML.pathname}`);
    process.exit(1);
  }

  const problems = compare(mdText, htmlText);

  // Derived numbers must match what scripts/fetch-solution-numbers.mjs last
  // measured. Without this, "derived" is just a word: the material can quote a
  // number the derivation never produced.
  const derived = await readFile(NUMBERS, 'utf8').then((t) => JSON.parse(t).numbers).catch(() => null);
  if (!derived) {
    problems.push('missing src/data/solution-numbers.json — run npm run solution:numbers');
  } else {
    const expected = {
      concepts: derived.concepts?.value,
      sources: derived.sources?.value,
      open_data_tools: derived.open_data_tools?.value,
      public_dashboards: derived.public_dashboards?.value,
      registry_total: derived.registry_total?.value,
    };
    const both = `${mdText}\n${plainText(htmlText)}`;
    const required = [
      ['concepts', String(expected.concepts ?? '')],
      ['sources', String(expected.sources ?? '')],
      ['open_data_tools', String(expected.open_data_tools ?? '')],
      ['public_dashboards', String(expected.public_dashboards ?? '')],
    ];
    for (const [key, value] of required) {
      if (!value || value === 'null') continue; // unreachable authority → page shows a threshold instead
      if (!new RegExp(`(?<![\\d.,])${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d,])`).test(both)) {
        problems.push(`派生值未落到材料：${key} = ${value}（见 src/data/solution-numbers.json）`);
      }
    }
  }

  if (problems.length) {
    console.error(`[solution-parity] ${problems.length} difference(s) between collateral/solution/solution.md and public/solution/index.html:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('[solution-parity] source and published page agree (chapters, numbers, demo entries)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`[solution-parity] ${err.message}`);
    process.exit(1);
  });
}