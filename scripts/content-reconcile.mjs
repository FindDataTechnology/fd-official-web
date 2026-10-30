#!/usr/bin/env node
// content-reconcile.mjs — 星研内容三处对账（只读，不写不修）
//
// 三处 = ① 内容来源清单（public/content-manifest.json，构建期写入并随产物发布）
//        ② 仓内内容文件（src/content/<zone>/<locale>/*.md）
//        ③ 构建产物 feed（dist/briefings.json / academy.json / research.json）
//
// 为什么需要：真源收敛后仍有两个异步面——CMS 里刚发的条目、仓里刚合的内容、
// 线上还在跑的旧镜像。三者不一致时页面看着「都正常」，只是内容旧了。对账把它
// 变成一条可执行的结论：逐区条目数与 claim 集合对得上，或指名差在哪。
//
// 用法：node scripts/content-reconcile.mjs      （构建后跑；只读）
//       node scripts/content-reconcile.mjs --json

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const CONTENT = 'src/content';
const ZONES = ['briefings', 'academy', 'research'];
const LOCALES = ['zh', 'en'];
const asJson = process.argv.includes('--json');

const problems = [];
const report = { zones: {}, manifest: null };

// ① 清单
const manifestPath = 'public/content-manifest.json';
if (existsSync(manifestPath)) {
  report.manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} else {
  problems.push('缺内容来源清单 public/content-manifest.json（构建期应由 strapi:fetch 写入）');
}

// ② 仓内文件
for (const zone of ZONES) {
  const files = [];
  for (const locale of LOCALES) {
    const dir = join(CONTENT, zone, locale);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (name.endsWith('.md')) files.push(`${zone}/${locale}/${name}`);
    }
  }
  report.zones[zone] = report.zones[zone] || {};
  report.zones[zone].files = files.length;
  report.zones[zone].slugs = new Set(files.map((f) => f.split('/').pop().replace(/\.md$/, ''))).size;
}

// ③ 产物 feed
for (const zone of ZONES) {
  const feedPath = join(DIST, `${zone}.json`);
  if (!existsSync(feedPath)) {
    problems.push(`缺产物 ${zone}.json（先跑 astro build）`);
    continue;
  }
  const feed = JSON.parse(readFileSync(feedPath, 'utf8'));
  const entries = feed[zone] ?? [];
  report.zones[zone].feedItems = entries.length;

  // claim 骨架逐条对账：两侧 ID 集合一致，且每条 evidence 非空
  for (const e of entries) {
    const en = (e.claims?.en ?? []).map((c) => c.id).sort();
    const zh = (e.claims?.zh ?? []).map((c) => c.id).sort();
    if (en.join(',') !== zh.join(',')) {
      problems.push(`${zone}/${e.slug}：双语 claim ID 集合不一致 en=[${en}] zh=[${zh}]`);
    }
    for (const c of [...(e.claims?.en ?? []), ...(e.claims?.zh ?? [])]) {
      if (!Array.isArray(c.evidence) || c.evidence.length === 0) {
        problems.push(`${zone}/${e.slug}：claim ${c.id} 缺 evidence`);
      }
    }
  }
}

// 清单与产物条目数一致性（清单按文件计，feed 按条目计——同区应当相等）
if (report.manifest) {
  for (const zone of ZONES) {
    const m = report.manifest.zones?.[zone];
    const z = report.zones[zone];
    if (m && z.feedItems !== undefined && m.items !== z.feedItems) {
      problems.push(`清单 ${zone} items=${m.items} 与 feed 条目数 ${z.feedItems} 不一致`);
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ ...report, zones: Object.fromEntries(Object.entries(report.zones).map(([k, v]) => [k, { ...v, slugs: v.slugs }])), problems }, null, 2));
} else {
  console.log('星研内容三处对账（只读）');
  if (report.manifest) {
    console.log(`  来源清单：source=${report.manifest.source} 生成于 ${report.manifest.generated_at}`);
  }
  for (const zone of ZONES) {
    const z = report.zones[zone];
    console.log(`  ${zone.padEnd(10)} 文件 ${String(z.files).padEnd(3)} 条目 ${String(z.slugs).padEnd(3)} feed ${z.feedItems ?? '-'}`);
  }
  if (problems.length) {
    console.error(`\n✗ 对账发现 ${problems.length} 处差异：`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('\n✓ 三处对账零差异。');
}
