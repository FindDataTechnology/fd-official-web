#!/usr/bin/env node
// check-discoverable.mjs — 构建期检查 AI 可发现面（robots / llms.txt / sitemap / 三个 feed）
//
// 为什么要有这一步：发现文件是「对外声明」，写错了不会报错，只会静默误导 AI 消费者
// （llms.txt 指向一个 404 的 feed，答案引擎就永远取不到内容）。所以把它做成构建门：
// 声明里的每个站内地址必须在本次产物里真实存在，三个 feed 必须在列，sitemap 必须
// 覆盖星研三区双语页面。
//
// 用法：node scripts/check-discoverable.mjs   （在 astro build 之后跑）

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE = 'https://www.finddatatech.cloud';
const problems = [];

const read = (p) => {
  const full = join(DIST, p);
  if (!existsSync(full)) {
    problems.push(`缺少产物 ${p}`);
    return null;
  }
  return readFileSync(full, 'utf8');
};

// 1) 三个 feed + 发现文件必须在
const feeds = ['briefings.json', 'academy.json', 'research.json'];
for (const f of feeds) {
  const body = read(f);
  if (body === null) continue;
  try {
    JSON.parse(body);
  } catch {
    problems.push(`${f} 不是合法 JSON`);
  }
}

const llms = read('llms.txt');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

// 2) llms.txt 必须列出三个 feed，且其中每个站内 URL 在产物中可达
if (llms) {
  for (const f of feeds) {
    if (!llms.includes(`/${f}`)) problems.push(`llms.txt 未列出 ${f}`);
  }
  const urls = [...llms.matchAll(/https:\/\/www\.finddatatech\.cloud(\/[^\s)\]"']*)?/g)].map((m) => m[1] ?? '/');
  for (const path of new Set(urls)) {
    const clean = path.replace(/[.,;]+$/, '');
    // 站内路径 → 产物路径：目录型路径落到 index.html，文件型路径原样
    const candidates = clean.endsWith('/')
      ? [join(clean.slice(1), 'index.html')]
      : [clean.slice(1), join(clean.slice(1), 'index.html')];
    if (!candidates.some((c) => existsSync(join(DIST, c)))) {
      problems.push(`llms.txt 指向的地址在产物中不存在：${clean}`);
    }
  }
}

// 3) robots.txt 必须声明 sitemap
if (robots && !robots.includes('Sitemap: ')) problems.push('robots.txt 缺 Sitemap 声明');

// 4) sitemap 必须覆盖星研三区双语页面
if (sitemap) {
  for (const zone of ['briefings', 'academy', 'articles']) {
    if (!sitemap.includes(`/research/${zone}/`)) problems.push(`sitemap 未覆盖 /research/${zone}/`);
    if (!sitemap.includes(`/zh/research/${zone}/`)) problems.push(`sitemap 未覆盖中文 /zh/research/${zone}/`);
  }
}

if (problems.length) {
  console.error('✗ 可发现面机检未通过：');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('✓ 可发现面机检通过（robots / llms.txt / sitemap / 三个 feed 均在产物中且相互指认）');
